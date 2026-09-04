import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = "kamalusosanjose@gmail.com";
const LOGO_URL = "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

const getTransporter = () => {
  const user = (process.env.EMAIL_SERVER_USER || "").replace(/^"|"$/g, "").trim();
  const pass = (process.env.EMAIL_SERVER_PASSWORD || "").replace(/^"|"$/g, "").trim();
  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

// Generar instrucciones bancarias con la paleta de marca oficial de Kamaluso (Fucsia/Rosa/Pizarra)
const getPaymentInstructionsHTML = (methodId: string, orderId: string) => {
  switch (methodId) {
    case "brou":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Transferencia Bancaria</span>
          </div>
          <h4 style="margin: 0 0 12px 0; color: #881337; font-size: 15px; font-weight: 900;">🏦 Datos para Transferencia BROU:</h4>
          
          <table style="width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse;">
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td style="padding: 6px 0; width: 140px; color: #9f1239; font-weight: 700;">Banco:</td>
              <td style="padding: 6px 0; font-weight: 600;">BROU (Banco República)</td>
            </tr>
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td style="padding: 6px 0; color: #9f1239; font-weight: 700;">Tipo de Cuenta:</td>
              <td style="padding: 6px 0;">Caja de Ahorro en Pesos (UYU)</td>
            </tr>
            <tr style="border-bottom: 1px dashed #fecdd3; background-color: #ffe4e6;">
              <td style="padding: 8px 6px; color: #881337; font-weight: 800;">N° Cuenta Actual:</td>
              <td style="padding: 8px 6px; font-family: monospace; font-size: 15px; font-weight: 900; color: #be123c; letter-spacing: 1px;">001199848-00001</td>
            </tr>
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td style="padding: 6px 0; color: #9f1239; font-weight: 700;">N° Cuenta Anterior:</td>
              <td style="padding: 6px 0; font-family: monospace;">013.0123275</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #9f1239; font-weight: 700;">Titular de Cuenta:</td>
              <td style="padding: 6px 0; font-weight: 700;">Martín CEDRÉS</td>
            </tr>
          </table>

          <div style="margin-top: 14px; padding: 10px 14px; background-color: #ffffff; border-radius: 10px; border-left: 4px solid #be123c; font-size: 12px; color: #881337; line-height: 1.5;">
            📲 <strong>Paso siguiente:</strong> Realiza la transferencia y envía el comprobante a nuestro WhatsApp <strong>098 615 074</strong> con el número de pedido <strong>#${orderId}</strong> para despachar tu paquete.
          </div>
        </div>
      `;
    case "oca_blue":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Depósito Digital</span>
          <h4 style="margin: 10px 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">💳 Datos para Depósito OCA Blue:</h4>
          <table style="width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse;">
            <tr style="background-color: #ffe4e6;">
              <td style="padding: 8px 6px; width: 140px; color: #881337; font-weight: 800;">N° Cuenta OCA Blue:</td>
              <td style="padding: 8px 6px; font-family: monospace; font-size: 15px; font-weight: 900; color: #be123c;">0216811</td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #881337;">
            📲 Envía el comprobante de depósito a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "prex":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Transferencia Prex</span>
          <h4 style="margin: 10px 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">💳 Datos para Transferencia Prex a Prex:</h4>
          <table style="width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse;">
            <tr style="background-color: #ffe4e6; border-bottom: 1px dashed #fecdd3;">
              <td style="padding: 8px 6px; width: 140px; color: #881337; font-weight: 800;">N° Cuenta Prex:</td>
              <td style="padding: 8px 6px; font-family: monospace; font-size: 15px; font-weight: 900; color: #be123c;">1216437</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #9f1239; font-weight: 700;">Titular:</td>
              <td style="padding: 6px 0; font-weight: 700;">Katherine Silva</td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #881337;">
            📲 Envía la captura del traspaso a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "mi_dinero":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Mi Dinero</span>
          <h4 style="margin: 10px 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">💳 Datos para Transferencia Mi Dinero:</h4>
          <table style="width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse;">
            <tr style="background-color: #ffe4e6;">
              <td style="padding: 8px 6px; width: 140px; color: #881337; font-weight: 800;">N° Cuenta Mi Dinero:</td>
              <td style="padding: 8px 6px; font-family: monospace; font-size: 15px; font-weight: 900; color: #be123c;">7537707</td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #881337;">
            📲 Envía el comprobante a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "abitab":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Giro en Red de Cobranza</span>
          <h4 style="margin: 10px 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">📍 Instrucciones para Giro ABITAB:</h4>
          <table style="width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse;">
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td style="padding: 6px 0; width: 140px; color: #9f1239; font-weight: 700;">Beneficiario:</td>
              <td style="padding: 6px 0; font-weight: 700;">Katherine SILVA</td>
            </tr>
            <tr style="background-color: #ffe4e6;">
              <td style="padding: 8px 6px; color: #881337; font-weight: 800;">Cédula de Identidad:</td>
              <td style="padding: 8px 6px; font-family: monospace; font-size: 15px; font-weight: 900; color: #be123c;">C.I. 4.798.217-8</td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #881337;">
            📲 Envía la foto del ticket a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "red_pagos":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Giro en Red de Cobranza</span>
          <h4 style="margin: 10px 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">📍 Instrucciones para Giro RED PAGOS:</h4>
          <table style="width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse;">
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td style="padding: 6px 0; width: 140px; color: #9f1239; font-weight: 700;">Beneficiario:</td>
              <td style="padding: 6px 0; font-weight: 700;">Katherine SILVA</td>
            </tr>
            <tr style="background-color: #ffe4e6;">
              <td style="padding: 8px 6px; color: #881337; font-weight: 800;">Cédula de Identidad:</td>
              <td style="padding: 8px 6px; font-family: monospace; font-size: 15px; font-weight: 900; color: #be123c;">C.I. 4.798.217-8</td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #881337;">
            📲 Envía la foto del ticket a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "efectivo":
      return `
        <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Pago Presencial</span>
          <h4 style="margin: 10px 0 8px 0; color: #166534; font-size: 15px; font-weight: 900;">📍 Pago en Efectivo en Local:</h4>
          <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.5;">
            Puedes abonar en efectivo al retirar tu pedido en nuestro taller de San José de Mayo indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "mercado_pago_online":
      return `
        <div style="background-color: #f0f9ff; border: 1.5px solid #bae6fd; padding: 20px; border-radius: 16px; margin-top: 20px;">
          <span style="background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Mercado Pago Online</span>
          <h4 style="margin: 10px 0 8px 0; color: #075985; font-size: 15px; font-weight: 900;">💳 Pago con Tarjeta de Crédito / Débito:</h4>
          <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.5;">
            Tu pago fue procesado a través de Mercado Pago. Tan pronto como se confirme la acreditación, tus insumos pasarán a empaque y preparación.
          </p>
        </div>
      `;
    default:
      return "";
  }
};

export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      cart,
      totalPrice,
      finalTotal,
      paymentMethodId,
      paymentMethodName,
      shippingMethodName,
      customer,
    } = await request.json();

    const displayOrderId = orderId || `KAM-${Date.now().toString().slice(-6)}`;
    const transporter = getTransporter();

    if (!transporter && !resend) {
      console.warn("Ni SMTP (Nodemailer) ni RESEND_API_KEY están configurados. Notificación por correo omitida.");
      return NextResponse.json({
        success: true,
        message: "Email skipped: No mailer provider configured",
      });
    }

    // Fecha actual formateada para Uruguay
    const formattedDate = new Intl.DateTimeFormat("es-UY", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Montevideo",
    }).format(new Date());

    const isMp = paymentMethodId === "mercado_pago_online";
    const mpSurcharge = isMp ? parseFloat((totalPrice * 0.1).toFixed(2)) : 0;
    const computedTotal = finalTotal || (totalPrice + mpSurcharge);

    // Tabla HTML de productos solicitados con diseño de remito Kamaluso
    let itemsRows = "";
    if (Array.isArray(cart)) {
      cart.forEach((item: any, index: number) => {
        const itemTotal = (item.product.price * item.quantity).toLocaleString("es-UY");
        const isEven = index % 2 === 0;
        itemsRows += `
          <tr style="background-color: ${isEven ? "#ffffff" : "#fff1f2"}; border-bottom: 1px solid #fecdd3;">
            <td style="padding: 14px 16px; font-size: 13px; color: #0f172a; line-height: 1.4;">
              <strong style="color: #4c0519;">${item.product.name}</strong>
            </td>
            <td style="padding: 14px 16px; font-size: 13px; color: #881337; text-align: center; font-weight: 800;">
              ${item.quantity} u.
            </td>
            <td style="padding: 14px 16px; font-size: 13px; color: #475569; text-align: right;">
              $${item.product.price.toLocaleString("es-UY")}
            </td>
            <td style="padding: 14px 16px; font-size: 14px; font-weight: 900; color: #be123c; text-align: right;">
              $${itemTotal} UYU
            </td>
          </tr>
        `;
      });
    }

    const isPickup = (shippingMethodName || "").toLowerCase().includes("retiro") || (customer?.address || "").toLowerCase().includes("retiro");

    const shippingClarification = isPickup
      ? `📍 <strong>Retiro Presencial:</strong> Te avisaremos por WhatsApp en cuanto el pedido esté listo para retirar en nuestro local de San José de Mayo sin costo alguno.`
      : `🚚 <strong>Flete de Encomienda:</strong> El costo del envío por agencia (${shippingMethodName || "DAC / Correo"}) se abona directamente en destino al recibir o retirar tu paquete.`;

    const paymentInstructionsHTML = getPaymentInstructionsHTML(paymentMethodId || "", displayOrderId);

    // 1. Email para el COMPRADOR (Recibo / Confirmación Oficial Kamaluso)
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pedido #${displayOrderId} - Kamaluso</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fce7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 620px; margin: 24px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 35px -5px rgba(190, 18, 60, 0.15); border: 2px solid #fecdd3;">
          
          <!-- Header Oficial con degradado de marca Kamaluso -->
          <div style="background: linear-gradient(135deg, #9f1239 0%, #be123c 45%, #e11d48 100%); padding: 34px 24px 28px 24px; text-align: center; color: #ffffff;">
            <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #fecdd3; font-weight: 800;">Fábrica de Papelería Sublimable</p>
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">KAMALUSO</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #ffe4e6; font-weight: 500;">San José de Mayo, Uruguay • Envíos a todo el país</p>
            
            <div style="display: inline-block; margin-top: 18px; padding: 7px 20px; background-color: #ffffff; border-radius: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              <span style="font-size: 13px; font-weight: 900; color: #be123c; letter-spacing: 0.5px;">PEDIDO #${displayOrderId}</span>
            </div>
          </div>

          <!-- Cuerpo Principal -->
          <div style="padding: 30px 24px;">
            <p style="font-size: 17px; color: #0f172a; margin-top: 0; margin-bottom: 8px; font-weight: 800;">
              ¡Hola, ${customer?.name || "Cliente"}! 🎉
            </p>
            <p style="font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 24px; line-height: 1.6;">
              ¡Muchas gracias por elegirnos! Recibimos tu compra correctamente en nuestro taller. A continuación te presentamos el <strong>resumen detallado de tus insumos</strong> y las instrucciones para coordinar el envío.
            </p>

            <!-- Ficha de Datos de Envío y Destino -->
            <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 18px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 14px 0; font-size: 12px; color: #881337; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900;">
                📍 DATOS DE ENTREGA Y DESTINO
              </h3>
              <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; width: 140px; font-weight: bold; color: #9f1239;">Destinatario:</td>
                  <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${customer?.name || "-"}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Teléfono / WhatsApp:</td>
                  <td style="padding: 5px 0; font-weight: 600;">${customer?.phone || "-"}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Agencia / Método:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #be123c;">${shippingMethodName || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Dirección / Localidad:</td>
                  <td style="padding: 5px 0; font-weight: 600;">${customer?.address || "-"}, ${customer?.city || "-"}, ${customer?.department || "-"}</td>
                </tr>
              </table>

              <div style="margin-top: 14px; padding: 10px 14px; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 12px; font-size: 12px; color: #881337; line-height: 1.5;">
                ${shippingClarification}
              </div>
            </div>

            <!-- Tabla de Insumos -->
            <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #881337; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900;">
              📦 DETALLE DE PRODUCTOS SOLICITADOS
            </h3>
            <div style="border: 2px solid #fecdd3; border-radius: 18px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #be123c 0%, #e11d48 100%); text-align: left; color: #ffffff;">
                    <th style="padding: 12px 16px; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Insumo</th>
                    <th style="padding: 12px 16px; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: center;">Cant.</th>
                    <th style="padding: 12px 16px; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: right;">Unitario</th>
                    <th style="padding: 12px 16px; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Caja de Totales -->
              <div style="background-color: #fff1f2; padding: 18px 20px; border-top: 2px solid #fecdd3;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px;">
                  <span>Subtotal Insumos:</span>
                  <span style="font-weight: 700; color: #1e293b;">$${totalPrice.toLocaleString("es-UY")} UYU</span>
                </div>
                ${
                  isMp
                    ? `
                  <div style="display: flex; justify-content: space-between; font-size: 13px; color: #be123c; margin-bottom: 6px;">
                    <span>Comisión Tarjeta Mercado Pago (+10%):</span>
                    <span style="font-weight: 700;">+$${mpSurcharge.toLocaleString("es-UY")} UYU</span>
                  </div>
                `
                    : ""
                }
                <div style="border-top: 1.5px solid #fecdd3; margin-top: 8px; padding-top: 10px; display: flex; justify-content: space-between; align-items: baseline;">
                  <span style="font-size: 14px; font-weight: 900; text-transform: uppercase; color: #4c0519;">Total a Pagar:</span>
                  <span style="font-size: 24px; font-weight: 900; color: #be123c;">$${computedTotal.toLocaleString("es-UY")} <span style="font-size: 13px; font-weight: 800; color: #881337;">UYU</span></span>
                </div>
              </div>
            </div>

            <!-- Ficha de Pago e Instrucciones -->
            <div style="margin-bottom: 24px;">
              <div style="font-size: 13px; color: #881337; margin-bottom: 6px;">
                <p style="margin: 0 0 4px 0;"><strong>Medio de Pago Seleccionado:</strong> <span style="color: #be123c; font-weight: 700;">${paymentMethodName || "-"}</span></p>
                <p style="margin: 0; font-size: 12px; color: #9f1239;">Fecha y Hora: ${formattedDate}</p>
              </div>

              ${paymentInstructionsHTML}
            </div>

            <!-- Botón Grande de WhatsApp Kamaluso -->
            <div style="text-align: center; margin-top: 32px; margin-bottom: 12px;">
              <a href="https://wa.me/59898615074?text=${encodeURIComponent(
                `Hola Kamaluso, te escribo por el pedido #${displayOrderId} a nombre de ${customer?.name || "cliente"}`
              )}" style="background-color: #16a34a; color: #ffffff; padding: 16px 32px; text-decoration: none; font-weight: 900; font-size: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35); letter-spacing: 0.5px;">
                📲 ENVIAR COMPROBANTE POR WHATSAPP (098 615 074)
              </a>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
                Atención personalizada directa desde nuestro taller en San José de Mayo.
              </p>
            </div>

          </div>

          <!-- Footer con Identidad Kamaluso -->
          <div style="background-color: #fff1f2; padding: 22px; text-align: center; border-top: 2px solid #fecdd3; font-size: 12px; color: #881337;">
            <p style="margin: 0 0 4px 0; font-weight: 900; color: #881337; font-size: 13px;">KAMALUSO SUBLIMACIÓN URUGUAY</p>
            <p style="margin: 0 0 8px 0; color: #9f1239;">Fabricantes directos de tapas de 350g, agendas, cuadernos y blocks para sublimadores.</p>
            <p style="margin: 0;">
              <a href="https://www.kamaluso.com" style="color: #be123c; text-decoration: none; font-weight: 800;">www.kamaluso.com</a> • WhatsApp: <strong>098 615 074</strong>
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    // 2. Email para la TIENDA (kamalusosanjose@gmail.com)
    const cleanCustomerPhone = (customer?.phone || "").replace(/[^0-9]/g, "");
    const waPhoneLink = cleanCustomerPhone.startsWith("0")
      ? `598${cleanCustomerPhone.slice(1)}`
      : cleanCustomerPhone.startsWith("598")
      ? cleanCustomerPhone
      : `598${cleanCustomerPhone}`;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Pedido #${displayOrderId}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 620px; margin: 24px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 2px solid #334155;">
          
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; color: #ffffff; border-bottom: 4px solid #be123c;">
            <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f472b6; font-weight: 800;">Panel de Ventas Kamaluso</p>
            <h1 style="margin: 0; font-size: 26px; font-weight: 900;">🛍️ NUEVO PEDIDO #${displayOrderId}</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">${formattedDate}</p>
          </div>

          <div style="padding: 26px 24px;">

            <!-- Ficha del Comprador -->
            <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 18px; padding: 20px; margin-bottom: 22px;">
              <h3 style="margin: 0 0 14px 0; font-size: 12px; color: #881337; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                👤 DATOS DEL CLIENTE / ENVÍO
              </h3>
              <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; width: 140px; font-weight: bold; color: #9f1239;">Nombre/Empresa:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">${customer?.name || "-"}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Teléfono / WhatsApp:</td>
                  <td style="padding: 5px 0;">
                    <a href="tel:${customer?.phone}" style="color: #be123c; text-decoration: none; font-weight: 800;">${customer?.phone || "-"}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Correo Electrónico:</td>
                  <td style="padding: 5px 0;">
                    <a href="mailto:${customer?.email}" style="color: #be123c; text-decoration: none; font-weight: 600;">${customer?.email || "-"}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Agencia / Método:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #be123c;">${shippingMethodName || "-"}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #fecdd3;">
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Dirección / Destino:</td>
                  <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${customer?.address || "-"}, ${customer?.city || "-"}, ${customer?.department || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #9f1239;">Método de Pago:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #166534;">${paymentMethodName || "-"}</td>
                </tr>
              </table>

              <div style="margin-top: 16px; text-align: center;">
                <a href="https://wa.me/${waPhoneLink}?text=${encodeURIComponent(
                  `Hola ${customer?.name || ""}, te contactamos de Kamaluso Sublimación con respecto a tu pedido #${displayOrderId}.`
                )}" style="background-color: #16a34a; color: #ffffff; padding: 12px 22px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block;">
                  💬 Escribir al Cliente por WhatsApp
                </a>
              </div>
            </div>

            <!-- Insumos para Armado -->
            <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
              📦 PRODUCTOS A EMPACAR
            </h3>
            <div style="border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 22px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 12px 14px; font-size: 11px; color: #475569; text-transform: uppercase;">Insumo</th>
                    <th style="padding: 12px 14px; font-size: 11px; color: #475569; text-transform: uppercase; text-align: center;">Cant.</th>
                    <th style="padding: 12px 14px; font-size: 11px; color: #475569; text-transform: uppercase; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
              <div style="background-color: #0f172a; color: #ffffff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Total del Pedido:</span>
                <span style="font-size: 22px; font-weight: 900; color: #f472b6;">$${computedTotal.toLocaleString("es-UY")} UYU</span>
              </div>
            </div>

          </div>

          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Kamaluso Sublimación • Sistema de Gestión de Taller
          </div>

        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.EMAIL_FROM || `Kamaluso Sublimación <${ADMIN_EMAIL}>`;

    // 1. Enviar correo al COMPRADOR
    if (customer?.email && customer.email.trim()) {
      const recipient = customer.email.trim();
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: recipient,
          replyTo: ADMIN_EMAIL,
          subject: `¡Confirmación de Pedido #${displayOrderId}! • Kamaluso Sublimación`,
          html: customerEmailHtml,
        }).catch((e) => console.error("Error enviando mail al comprador (Nodemailer):", e));
      } else if (resend) {
        await resend.emails.send({
          from: "Kamaluso Sublimación <onboarding@resend.dev>",
          to: [recipient],
          replyTo: ADMIN_EMAIL,
          subject: `¡Confirmación de Pedido #${displayOrderId}! • Kamaluso Sublimación`,
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
        subject: `🛍️ NUEVO PEDIDO #${displayOrderId}: ${customer?.name || "Cliente"} ($${computedTotal.toLocaleString("es-UY")} UYU) - ${shippingMethodName || "Envío"}`,
        html: adminEmailHtml,
      }).catch((e) => console.error("Error enviando mail al admin (Nodemailer):", e));
    } else if (resend) {
      adminRes = await resend.emails.send({
        from: "Kamaluso Web <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        replyTo: customer?.email && customer.email.trim() ? customer.email.trim() : undefined,
        subject: `🛍️ NUEVO PEDIDO #${displayOrderId}: ${customer?.name || "Cliente"} ($${computedTotal.toLocaleString("es-UY")} UYU) - ${shippingMethodName || "Envío"}`,
        html: adminEmailHtml,
      }).catch((e) => console.error("Error enviando mail al admin (Resend):", e));
    }

    return NextResponse.json({ success: true, orderId: displayOrderId, adminRes });
  } catch (error) {
    console.error("Error enviando emails en /api/send-email:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
