import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const TARGET_EMAIL = "kamalusosanjose@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const { cart, totalPrice, finalTotal, paymentMethodName, shippingMethodName, customer } = await request.json();

    if (!resend) {
      console.warn("RESEND_API_KEY no configurado. Email no enviado pero pedido procesado.");
      return NextResponse.json({
        success: true,
        message: "Email skipped: RESEND_API_KEY not configured",
      });
    }

    // Construir tabla HTML de productos
    let itemsRows = "";
    if (Array.isArray(cart)) {
      cart.forEach((item: any, index: number) => {
        const itemTotal = (item.product.price * item.quantity).toLocaleString("es-UY");
        itemsRows += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-size: 13px; color: #1e293b;">${index + 1}. <strong>${item.product.name}</strong></td>
            <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: right;">$${item.product.price.toLocaleString("es-UY")} UYU</td>
            <td style="padding: 10px; font-size: 13px; font-weight: bold; color: #0f172a; text-align: right;">$${itemTotal} UYU</td>
          </tr>
        `;
      });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">🛍️ NUEVO PEDIDO EN LA WEB</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">Kamaluso Sublimación • San José de Mayo</p>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <!-- Customer Info -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">👤 DATOS DEL CLIENTE</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Nombre / Empresa:</strong> ${customer?.name || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Teléfono / WhatsApp:</strong> ${customer?.phone || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Correo Electrónico:</strong> <a href="mailto:${customer?.email}" style="color: #db2777;">${customer?.email || "-"}</a></p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Ubicación:</strong> ${customer?.city || "-"}, ${customer?.department || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Dirección / Punto de Envío:</strong> ${customer?.address || "-"}</p>
          </div>

          <!-- Order Summary Table -->
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">📦 DETALLE DE PRODUCTOS SOLICITADOS</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 10px; font-size: 12px; color: #475569; text-transform: uppercase;">Producto</th>
                <th style="padding: 10px; font-size: 12px; color: #475569; text-transform: uppercase; text-align: center;">Cant.</th>
                <th style="padding: 10px; font-size: 12px; color: #475569; text-transform: uppercase; text-align: right;">Unitario</th>
                <th style="padding: 10px; font-size: 12px; color: #475569; text-transform: uppercase; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Totals & Payment Details -->
          <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 13px; color: #831843;"><strong>Método de Pago:</strong> ${paymentMethodName || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #831843;"><strong>Forma de Envío:</strong> ${shippingMethodName || "-"}</p>
            <hr style="border: none; border-top: 1px solid #fbcfe8; margin: 10px 0;" />
            <p style="margin: 4px 0; font-size: 16px; font-weight: bold; color: #9d174d; text-align: right;">
              TOTAL DEL PEDIDO: $${(finalTotal || totalPrice || 0).toLocaleString("es-UY")} UYU
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">Notificación automática enviada desde Kamaluso Sublimación Web.</p>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: "Kamaluso Web <onboarding@resend.dev>",
      to: [TARGET_EMAIL],
      replyTo: customer?.email ? [customer.email] : undefined,
      subject: `🛍️ Nuevo Pedido Web: ${customer?.name || "Cliente"} ($${(finalTotal || totalPrice || 0).toLocaleString("es-UY")} UYU)`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error enviando email en /api/send-email:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
