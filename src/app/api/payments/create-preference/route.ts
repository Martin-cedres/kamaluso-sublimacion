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
    const { items, customer, shippingMethod, paymentMethod } = body;

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
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    );

    // Recargo del 10% si se paga con tarjeta Mercado Pago Online
    if (paymentMethod === "mercado_pago_online") {
      const surcharge = parseFloat((subtotal * 0.1).toFixed(2));
      preferenceItems.push({
        id: "recargo-mp",
        title: "Recargo comisión Mercado Pago (10%)",
        description: "Comisión por procesamiento de tarjeta",
        quantity: 1,
        unit_price: surcharge,
        currency_id: "UYU",
      });
    }

    const host = req.headers.get("host") || "www.kamaluso.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const preferenceData = {
      items: preferenceItems,
      payer: {
        name: customer?.name || "Cliente Kamaluso",
        email: (customer?.email && customer.email.trim()) ? customer.email.trim() : "cliente@kamaluso.com",
        phone: {
          number: customer?.phone || "",
        },
      },
      back_urls: {
        success: `${baseUrl}/?payment=success`,
        failure: `${baseUrl}/?payment=failure`,
        pending: `${baseUrl}/?payment=pending`,
      },
      auto_return: "approved",
      external_reference: `KAM-${Date.now()}`,
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
