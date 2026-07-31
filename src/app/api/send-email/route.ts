import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = "kamalusosanjose@gmail.com";

const getTransporter = () => {
  if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }
  return null;
};

// Generar instrucciones bancarias exactas extraídas de la base comercial Kamaluso
const getPaymentInstructionsHTML = (methodId: string) => {
  switch (methodId) {
    case "brou":
      return `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📌 Instrucciones para Transferencia BROU:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Banco:</strong> BROU (Banco República)</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Tipo de cuenta:</strong> Caja de Ahorro en Pesos</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>N° de Cuenta Actual:</strong> 001199848-00001</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>N° de Cuenta Anterior:</strong> 013.0123275</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Titular:</strong> Martín CEDRÉS</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #2563eb;">📲 <em>Por favor envía el comprobante de transferencia a nuestro WhatsApp <strong>098 615 074</strong> para comenzar la preparación.</em></p>
        </div>
      `;
    case "oca_blue":
      return `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📌 Instrucciones para Depósito OCA Blue:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>N° de Cuenta OCA Blue:</strong> 0216811</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #2563eb;">📲 <em>Por favor envía el comprobante de depósito a nuestro WhatsApp <strong>098 615 074</strong>.</em></p>
        </div>
      `;
    case "prex":
      return `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📌 Instrucciones para Transferencia / Depósito Prex:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>N° de Cuenta Prex:</strong> 1216437</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Titular:</strong> Katherine Silva</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #2563eb;">📲 <em>Por favor envía el comprobante a nuestro WhatsApp <strong>098 615 074</strong>.</em></p>
        </div>
      `;
    case "mi_dinero":
      return `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📌 Instrucciones para Transferencia Mi Dinero:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>N° de Cuenta Mi Dinero (APP):</strong> 7537707</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #2563eb;">📲 <em>Por favor envía el comprobante a nuestro WhatsApp <strong>098 615 074</strong>.</em></p>
        </div>
      `;
    case "abitab":
      return `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📌 Instrucciones para Giro ABITAB:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Titular del Giro:</strong> Katherine SILVA</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Cédula de Identidad:</strong> C.I. 4.798.217-8</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #2563eb;">📲 <em>Por favor envía el ticket del giro a nuestro WhatsApp <strong>098 615 074</strong>.</em></p>
        </div>
      `;
    case "red_pagos":
      return `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📌 Instrucciones para Giro RED PAGOS:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Titular del Giro:</strong> Katherine SILVA</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e3a8a;"><strong>Cédula de Identidad:</strong> C.I. 4.798.217-8</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #2563eb;">📲 <em>Por favor envía el ticket del giro a nuestro WhatsApp <strong>098 615 074</strong>.</em></p>
        </div>
      `;
    case "efectivo":
      return `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 14px;">📍 Pago en Efectivo en Local:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #14532d;">Puedes abonar en efectivo directamente al retirar tu pedido en nuestro local comercial de San José de Mayo.</p>
        </div>
      `;
    case "mercado_pago_online":
      return `
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #075985; font-size: 14px;">💳 Pago con Tarjeta de Crédito / Débito:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #0c4a6e;">Tu pago es procesado de forma segura a través de Mercado Pago. Te notificarémos cuando la acreditación esté confirmada.</p>
        </div>
      `;
    default:
      return "";
  }
};

export async function POST(request: NextRequest) {
  try {
    const { cart, totalPrice, finalTotal, paymentMethodId, paymentMethodName, shippingMethodName, customer } = await request.json();

    const transporter = getTransporter();

    if (!transporter && !resend) {
      console.warn("Ni SMTP (Nodemailer) ni RESEND_API_KEY están configurados. Notificación por correo omitida.");
      return NextResponse.json({
        success: true,
        message: "Email skipped: No mailer provider configured",
      });
    }

    // Tabla HTML de productos
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

    const paymentInstructionsHTML = getPaymentInstructionsHTML(paymentMethodId || "");

    // 1. Email para el COMPRADOR con instrucciones bancarias completas
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #db2777; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold;">¡Gracias por tu compra, ${customer?.name || "cliente"}! 🎉</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #fbcfe8;">Kamaluso Sublimación • San José de Mayo</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">
            Hemos recibido tu pedido correctamente. A continuación te detallamos los productos solicitados y las <strong>instrucciones de pago</strong> para procesar tu envío.
          </p>

          <!-- Resumen de Productos -->
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase;">📦 RESUMEN DEL PEDIDO</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
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

          <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 13px; color: #831843;"><strong>Método de Pago Seleccionado:</strong> ${paymentMethodName || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #831843;"><strong>Forma de Envío:</strong> ${shippingMethodName || "-"}</p>
            <hr style="border: none; border-top: 1px solid #fbcfe8; margin: 10px 0;" />
            <p style="margin: 4px 0; font-size: 17px; font-weight: bold; color: #9d174d; text-align: right;">
              TOTAL A PAGAR: $${(finalTotal || totalPrice || 0).toLocaleString("es-UY")} UYU
            </p>
          </div>

          <!-- Instrucciones de Pago para el Cliente -->
          ${paymentInstructionsHTML}

          <!-- Botón de WhatsApp -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/59898615074" style="background-color: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; display: inline-block;">
              💬 Contactar por WhatsApp (098 615 074)
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">Kamaluso Sublimación • Insumos y Papelería de Calidad en Uruguay</p>
        </div>
      </div>
    `;

    // 2. Email para la TIENDA (kamalusosanjose@gmail.com)
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold;">🛍️ NUEVO PEDIDO RECIBIDO</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">Venta realizada en la tienda web</p>
        </div>

        <div style="padding: 24px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase;">👤 DATOS DEL COMPRADOR</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Nombre / Empresa:</strong> ${customer?.name || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Teléfono / WhatsApp:</strong> ${customer?.phone || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Correo Electrónico:</strong> ${customer?.email || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Ubicación:</strong> ${customer?.city || "-"}, ${customer?.department || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Dirección / Destino:</strong> ${customer?.address || "-"}</p>
          </div>

          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase;">📦 PRODUCTOS SOLICITADOS</h3>
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

          <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; padding: 16px; border-radius: 12px;">
            <p style="margin: 4px 0; font-size: 13px; color: #831843;"><strong>Método de Pago:</strong> ${paymentMethodName || "-"}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #831843;"><strong>Forma de Envío:</strong> ${shippingMethodName || "-"}</p>
            <hr style="border: none; border-top: 1px solid #fbcfe8; margin: 10px 0;" />
            <p style="margin: 4px 0; font-size: 16px; font-weight: bold; color: #9d174d; text-align: right;">
              TOTAL DEL PEDIDO: $${(finalTotal || totalPrice || 0).toLocaleString("es-UY")} UYU
            </p>
          </div>
        </div>
      </div>
    `;

    const fromAddress = process.env.EMAIL_FROM || `Kamaluso Sublimación <${ADMIN_EMAIL}>`;

    // 1. Enviar correo al COMPRADOR (solo si proporcionó correo)
    if (customer?.email && customer.email.trim()) {
      const recipient = customer.email.trim();
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: recipient,
          replyTo: ADMIN_EMAIL,
          subject: `¡Gracias por tu compra en Kamaluso Sublimación! 🛍️`,
          html: customerEmailHtml,
        }).catch((e) => console.error("Error enviando mail al comprador (Nodemailer):", e));
      } else if (resend) {
        await resend.emails.send({
          from: "Kamaluso Sublimación <onboarding@resend.dev>",
          to: [recipient],
          replyTo: ADMIN_EMAIL,
          subject: `¡Gracias por tu compra en Kamaluso Sublimación! 🛍️`,
          html: customerEmailHtml,
        }).catch((e) => console.error("Error enviando mail al comprador (Resend):", e));
      }
    }

    // 2. Enviar correo a la TIENDA (kamalusosanjose@gmail.com)
    let adminRes = null;
    if (transporter) {
      adminRes = await transporter.sendMail({
        from: fromAddress,
        to: ADMIN_EMAIL,
        replyTo: customer?.email && customer.email.trim() ? customer.email.trim() : undefined,
        subject: `🛍️ Nuevo Pedido Web: ${customer?.name || "Cliente"} ($${(finalTotal || totalPrice || 0).toLocaleString("es-UY")} UYU)`,
        html: adminEmailHtml,
      }).catch((e) => console.error("Error enviando mail al admin (Nodemailer):", e));
    } else if (resend) {
      adminRes = await resend.emails.send({
        from: "Kamaluso Web <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        replyTo: customer?.email && customer.email.trim() ? customer.email.trim() : undefined,
        subject: `🛍️ Nuevo Pedido Web: ${customer?.name || "Cliente"} ($${(finalTotal || totalPrice || 0).toLocaleString("es-UY")} UYU)`,
        html: adminEmailHtml,
      }).catch((e) => console.error("Error enviando mail al admin (Resend):", e));
    }

    return NextResponse.json({ success: true, adminRes });
  } catch (error) {
    console.error("Error enviando emails en /api/send-email:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
