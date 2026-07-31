import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { cartItems, totalPrice, customerInfo } = await request.json();

    if (!resend) {
      return NextResponse.json({
        success: true,
        message: "Email skipped: RESEND_API_KEY not configured",
      });
    }

    let itemsHtml = "<ul>";
    cartItems.forEach((item: any) => {
      itemsHtml += `<li><strong>${item.product.name}</strong> - Cantidad: ${item.quantity} - Price: $${item.product.price} UYU</li>`;
    });
    itemsHtml += "</ul>";

    const data = await resend.emails.send({
      from: "Kamaluso Web <pedidos@kamaluso.com>",
      to: ["contacto@kamaluso.com"],
      subject: `Nuevo pedido de papelería sublimable - Total $${totalPrice} UYU`,
      html: `
        <h2>Nuevo Pedido recibido en la Web</h2>
        ${itemsHtml}
        <p><strong>Total Estimado: $${totalPrice} UYU</strong></p>
        <p>Cliente: ${customerInfo?.name || "No especificado"}</p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
