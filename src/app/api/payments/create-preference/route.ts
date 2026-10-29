import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { message: "MERCADOPAGO_ACCESS_TOKEN no configurado" },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const body = await req.json();
    const {
      items,
      customer,
      shippingMethod,
      shippingMethodName,
      paymentMethod,
      paymentMethodName,
      orderId,
      totalPrice,
      finalTotal,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "El carrito está vacío" },
        { status: 400 }
      );
    }

    // Mapear los ítems del carrito para Mercado Pago
    const preferenceItems = items.map((item: any) => ({
      id: item.product.id,
      title: item.product.name,
      description: item.product.description || "Insumo de sublimación",
      quantity: item.quantity,
      unit_price: Number(item.product.price),
      currency_id: "UYU",
    }));

    // Subtotal
    const subtotal =
      typeof totalPrice === "number" && totalPrice > 0
        ? totalPrice
        : items.reduce(
            (sum: number, item: any) => sum + item.product.price * item.quantity,
            0
          );

    // Recargo del 10% si se paga con tarjeta Mercado Pago Online
    const surcharge =
      paymentMethod === "mercado_pago_online"
        ? parseFloat((subtotal * 0.1).toFixed(2))
        : 0;

    if (paymentMethod === "mercado_pago_online" && surcharge > 0) {
      preferenceItems.push({
        id: "recargo-mp",
        title: "Recargo comisión Mercado Pago (10%)",
        description: "Comisión por procesamiento de tarjeta",
        quantity: 1,
        unit_price: surcharge,
        currency_id: "UYU",
      });
    }

    const computedFinalTotal =
      typeof finalTotal === "number" && finalTotal > 0
        ? finalTotal
        : parseFloat((subtotal + surcharge).toFixed(2));

    const host = req.headers.get("host") || "www.kamaluso.com";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocalhost ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const validOrderId = orderId || `KAM-${Date.now().toString().slice(-6)}`;
    const cleanEmail =
      customer?.email && customer.email.trim()
        ? customer.email.trim()
        : "cliente@kamaluso.com";

    // Respaldo compacto de ítems en metadata para reconstrucción ante contingencias
    const compactItems = items.map((item: any) => ({
      id: item.product?.id || "item",
      n: item.product?.name || "Producto",
      p: Number(item.product?.price) || 0,
      q: Number(item.quantity) || 1,
      c: item.product?.category || "agenda",
    }));

    const webhookBaseUrl = isLocalhost ? "https://www.kamaluso.com" : baseUrl;

    const preferenceData: any = {
      items: preferenceItems,
      payer: {
        name: customer?.name || "Cliente Kamaluso",
        email: cleanEmail,
        phone: {
          number: customer?.phone || "",
        },
      },
      back_urls: {
        success: `${baseUrl}/checkout/success?orderId=${encodeURIComponent(
          validOrderId
        )}&email=${encodeURIComponent(cleanEmail)}&payment=approved`,
        failure: `${baseUrl}/checkout?payment=failure&orderId=${encodeURIComponent(
          validOrderId
        )}`,
        pending: `${baseUrl}/checkout/success?orderId=${encodeURIComponent(
          validOrderId
        )}&email=${encodeURIComponent(cleanEmail)}&payment=pending`,
      },
      auto_return: "approved",
      external_reference: validOrderId,
      notification_url: `${webhookBaseUrl}/api/payments/webhook`,
      metadata: {
        order_id: validOrderId,
        customer_name: customer?.name || "",
        customer_phone: customer?.phone || "",
        customer_email: cleanEmail,
        customer_department: customer?.department || "",
        customer_city: customer?.city || "",
        customer_address: customer?.address || "",
        customer_observations: customer?.observations || "",
        shipping_method: shippingMethod || "",
        shipping_method_name:
          shippingMethodName || shippingMethod || "A coordinar",
        payment_method: paymentMethod || "mercado_pago_online",
        payment_method_name:
          paymentMethodName || "Tarjeta de Crédito / Débito (Mercado Pago)",
        total_price: subtotal,
        final_total: computedFinalTotal,
        items_json: JSON.stringify(compactItems),
      },
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { message: error?.message || "Error al conectar con Mercado Pago" },
      { status: 500 }
    );
  }
}
