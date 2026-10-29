import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getLatestServerOrders, upsertServerOrder } from "@/lib/server-orders";
import { sendOrderEmails } from "@/lib/mailer";
import { CartItem, Order } from "@/types";

export const dynamic = "force-dynamic";

function extractPayerDetails(paymentData: any): {
  payerEmail?: string;
  payerName?: string;
  paymentId: string;
  status: string;
} {
  const paymentId = String(paymentData?.id || "");
  const status = String(paymentData?.status || "pending");

  const rawEmail =
    paymentData?.payer?.email ||
    paymentData?.additional_info?.payer?.email ||
    "";
  const payerEmail =
    typeof rawEmail === "string" &&
    rawEmail.includes("@") &&
    !rawEmail.includes("testuser.com")
      ? rawEmail.trim()
      : typeof rawEmail === "string" && rawEmail.includes("@")
      ? rawEmail.trim()
      : undefined;

  const firstName =
    paymentData?.payer?.first_name ||
    paymentData?.additional_info?.payer?.first_name ||
    "";
  const lastName =
    paymentData?.payer?.last_name ||
    paymentData?.additional_info?.payer?.last_name ||
    "";
  const cardholderName = paymentData?.card?.cardholder?.name || "";

  const combinedName = [firstName, lastName]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");

  const payerName = combinedName || String(cardholderName || "").trim() || undefined;

  return {
    paymentId,
    status,
    payerEmail,
    payerName,
  };
}

function reconstructCartFromPayment(paymentData: any): CartItem[] {
  const meta = paymentData?.metadata || {};

  // 1. Intentar desde metadata.items_json
  if (typeof meta.items_json === "string" && meta.items_json.trim()) {
    try {
      const parsed = JSON.parse(meta.items_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((it: any) => ({
          product: {
            id: String(it.id || "item"),
            slug: String(it.id || "item"),
            name: String(it.n || "Insumo Kamaluso"),
            description: "Insumo de sublimación",
            price: Number(it.p) || 0,
            currency: "UYU",
            category: (it.c as any) || "agenda",
            images: [],
            inStock: true,
          },
          quantity: Number(it.q) || 1,
        }));
      }
    } catch {}
  }

  // 2. Fallback: additional_info.items de Mercado Pago (excluyendo el ítem de recargo)
  const mpItems = paymentData?.additional_info?.items;
  if (Array.isArray(mpItems) && mpItems.length > 0) {
    return mpItems
      .filter((it: any) => it.id !== "recargo-mp" && !String(it.title || "").toLowerCase().includes("recargo comisión"))
      .map((it: any, idx: number) => ({
        product: {
          id: String(it.id || `mp-item-${idx}`),
          slug: String(it.id || `mp-item-${idx}`),
          name: String(it.title || "Insumo Kamaluso"),
          description: String(it.description || "Insumo de sublimación"),
          price: Number(it.unit_price) || 0,
          currency: "UYU",
          category: "agenda",
          images: [],
          inStock: true,
        },
        quantity: Number(it.quantity) || 1,
      }));
  }

  return [];
}

async function processPaymentVerification(params: {
  paymentId?: string | null;
  orderId?: string | null;
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return {
      ok: false,
      status: 500,
      message: "MERCADOPAGO_ACCESS_TOKEN no configurado",
    };
  }

  const client = new MercadoPagoConfig({ accessToken });
  const paymentApi = new Payment(client);

  let paymentData: any = null;

  // 1. Buscar por paymentId directo si está presente
  if (params.paymentId && /^\d+$/.test(String(params.paymentId).trim())) {
    try {
      paymentData = await paymentApi.get({ id: String(params.paymentId).trim() });
    } catch (err) {
      console.warn(`No se pudo obtener pago MP #${params.paymentId}:`, err);
    }
  }

  // 2. Si no se encontró por paymentId, buscar por external_reference (orderId)
  if (!paymentData && params.orderId) {
    try {
      const searchRes: any = await paymentApi.search({
        options: {
          external_reference: String(params.orderId).trim(),
          sort: "date_created",
          criteria: "desc",
        } as any,
      });
      const results = searchRes?.results || [];
      if (Array.isArray(results) && results.length > 0) {
        // Priorizar un pago aprobado si hay varios intentos
        paymentData =
          results.find((r: any) => r.status === "approved") || results[0];
      }
    } catch (err) {
      console.warn(`Error buscando pagos para orden ${params.orderId}:`, err);
    }
  }

  if (!paymentData) {
    return {
      ok: false,
      status: 404,
      message: "Pago no encontrado en Mercado Pago",
    };
  }

  const meta = paymentData.metadata || {};
  const resolvedOrderId =
    String(
      paymentData.external_reference ||
        meta.order_id ||
        params.orderId ||
        `KAM-${String(paymentData.id).slice(-6)}`
    ).trim();

  const { paymentId, status, payerEmail, payerName } =
    extractPayerDetails(paymentData);

  const isApproved = status === "approved" || status === "authorized";

  // Consultar órdenes actuales en el servidor
  const currentOrders = await getLatestServerOrders();
  const existingOrder = currentOrders.find((o) => o.id === resolvedOrderId);

  // Si ya fue procesado el pago aprobado y enviado el correo, evitar duplicados
  if (
    existingOrder &&
    existingOrder.emailSent &&
    existingOrder.status === "pago_confirmado" &&
    existingOrder.mpPaymentId === paymentId
  ) {
    return {
      ok: true,
      status: 200,
      alreadyProcessed: true,
      orderId: resolvedOrderId,
      paymentId,
      paymentStatus: status,
    };
  }

  // Construir o enriquecer datos del pedido
  const reconstructedItems =
    existingOrder && existingOrder.items && existingOrder.items.length > 0
      ? existingOrder.items
      : reconstructCartFromPayment(paymentData);

  const subtotalFromItems = reconstructedItems.reduce(
    (acc, item) => acc + Number(item.product.price) * Number(item.quantity),
    0
  );

  const totalPrice =
    existingOrder?.totalPrice ||
    Number(meta.total_price) ||
    subtotalFromItems ||
    Number(paymentData.transaction_amount) ||
    0;

  const finalTotal =
    Number(paymentData.transaction_amount) ||
    existingOrder?.finalTotal ||
    Number(meta.final_total) ||
    totalPrice;

  const customer: Order["customer"] = {
    name:
      existingOrder?.customer?.name ||
      meta.customer_name ||
      payerName ||
      "Cliente Kamaluso",
    phone:
      existingOrder?.customer?.phone ||
      meta.customer_phone ||
      paymentData?.payer?.phone?.number ||
      paymentData?.additional_info?.payer?.phone?.number ||
      "-",
    email:
      existingOrder?.customer?.email ||
      meta.customer_email ||
      payerEmail ||
      "",
    department:
      existingOrder?.customer?.department ||
      meta.customer_department ||
      "",
    city: existingOrder?.customer?.city || meta.customer_city || "",
    address:
      existingOrder?.customer?.address ||
      meta.customer_address ||
      "A coordinar",
    observations:
      existingOrder?.customer?.observations ||
      meta.customer_observations ||
      "",
  };

  const shippingMethodName =
    existingOrder?.shippingMethodName ||
    meta.shipping_method_name ||
    meta.shipping_method ||
    "A coordinar";

  const paymentMethodName =
    existingOrder?.paymentMethodName ||
    meta.payment_method_name ||
    "Tarjeta de Crédito / Débito (Mercado Pago)";

  const mpNote = `[Pago MP #${paymentId} (${status})${
    payerName ? ` por ${payerName}` : ""
  }${payerEmail ? ` <${payerEmail}>` : ""}]`;

  const baseObs = existingOrder?.observations || customer.observations || "";
  const updatedObservations = baseObs.includes(`#${paymentId}`)
    ? baseObs
    : [baseObs, mpNote].filter(Boolean).join(" • ");

  const newOrderStatus: Order["status"] = isApproved
    ? "pago_confirmado"
    : existingOrder?.status || "pendiente";

  // Enviar correo solo cuando el pago está aprobado (o autorizado) y aún no se envió
  let emailSent = existingOrder?.emailSent || false;
  let emailSentAt = existingOrder?.emailSentAt;

  if (isApproved && !emailSent) {
    try {
      const emailRes = await sendOrderEmails({
        orderId: resolvedOrderId,
        cart: reconstructedItems,
        totalPrice,
        finalTotal,
        paymentMethodId: "mercado_pago_online",
        paymentMethodName,
        shippingMethodName,
        customer,
        mpPaymentInfo: {
          paymentId,
          payerEmail,
          payerName,
          status,
        },
      });
      if (emailRes.success && !emailRes.skipped) {
        emailSent = true;
        emailSentAt = new Date().toISOString();
      }
    } catch (emailErr) {
      console.error(
        `Error enviando emails para orden MP #${resolvedOrderId}:`,
        emailErr
      );
    }
  }

  // Persistir orden actualizada en Vercel Blob + memoria
  const savedOrder = await upsertServerOrder({
    id: resolvedOrderId,
    createdAt: existingOrder?.createdAt || paymentData.date_created || new Date().toISOString(),
    customer,
    items: reconstructedItems,
    totalPrice,
    finalTotal,
    paymentMethodId: "mercado_pago_online",
    paymentMethodName,
    shippingMethodName,
    status: newOrderStatus,
    observations: updatedObservations,
    mpPaymentId: paymentId,
    mpPayerEmail: payerEmail,
    mpPayerName: payerName,
    emailSent,
    emailSentAt,
  });

  return {
    ok: true,
    status: 200,
    orderId: resolvedOrderId,
    paymentId,
    paymentStatus: status,
    emailSent,
    order: savedOrder,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryTopic = searchParams.get("topic") || searchParams.get("type");
    const queryDataId =
      searchParams.get("data.id") || searchParams.get("id");
    const queryOrderId = searchParams.get("orderId");

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const topic = body?.type || body?.topic || queryTopic;
    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.paymentId ||
      queryDataId ||
      null;
    const orderId = body?.orderId || queryOrderId || null;

    // Si es una notificación de Mercado Pago de otro tipo (ej. merchant_order sin paymentId ni orderId), responder 200 OK
    if (topic && topic !== "payment" && !paymentId && !orderId) {
      return NextResponse.json({ received: true, ignoredTopic: topic });
    }

    if (!paymentId && !orderId) {
      return NextResponse.json({ received: true, noIdentifier: true });
    }

    const result = await processPaymentVerification({
      paymentId: paymentId ? String(paymentId) : null,
      orderId: orderId ? String(orderId) : null,
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 200 });
  } catch (error: any) {
    console.error("Error en webhook de Mercado Pago:", error);
    // Siempre responder 200 a Mercado Pago para evitar reintentos infinitos si el error no es recuperable,
    // pero registrando el detalle
    return NextResponse.json(
      { ok: false, error: error?.message || "Webhook error" },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId =
      searchParams.get("data.id") ||
      searchParams.get("payment_id") ||
      searchParams.get("collection_id") ||
      searchParams.get("id");
    const orderId =
      searchParams.get("orderId") || searchParams.get("external_reference");

    if (!paymentId && !orderId) {
      return NextResponse.json({ status: "webhook_active" });
    }

    const result = await processPaymentVerification({
      paymentId,
      orderId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Error verificando pago" },
      { status: 500 }
    );
  }
}
