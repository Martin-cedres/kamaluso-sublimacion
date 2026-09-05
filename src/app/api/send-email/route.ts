import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = "kamalusosanjose@gmail.com";

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

// Generar instrucciones bancarias responsivas y 100% compatibles con cualquier cliente de correo
const getPaymentInstructionsHTML = (methodId: string, orderId: string) => {
  const tableBaseStyle = "width: 100%; font-size: 13px; color: #4c0519; border-collapse: collapse; table-layout: fixed; margin: 0;";
  const labelStyle = "padding: 7px 4px 7px 0; width: 38%; color: #9f1239; font-weight: 700; vertical-align: top; word-break: break-word;";
  const valueStyle = "padding: 7px 0 7px 4px; width: 62%; color: #0f172a; vertical-align: top; word-break: break-word;";

  switch (methodId) {
    case "brou":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 10px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">Transferencia Bancaria</span>
          </div>
          <h4 style="margin: 0 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">🏦 Datos para Transferencia BROU:</h4>
          
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${tableBaseStyle}">
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="${labelStyle}">Banco:</td>
              <td class="value-col" style="${valueStyle} font-weight: 600;">BROU (Banco República)</td>
            </tr>
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="${labelStyle}">Tipo de Cuenta:</td>
              <td class="value-col" style="${valueStyle}">Caja de Ahorro en Pesos (UYU)</td>
            </tr>
            <tr style="border-bottom: 1px dashed #fecdd3; background-color: #ffe4e6;">
              <td class="label-col" style="padding: 8px 4px 8px 6px; width: 38%; color: #881337; font-weight: 800; vertical-align: middle;">N° Cuenta Actual:</td>
              <td class="value-col" style="padding: 8px 6px 8px 4px; width: 62%; font-family: monospace, Courier, monospace; font-size: 15px; font-weight: 900; color: #be123c; letter-spacing: 0.5px; vertical-align: middle; word-break: break-all;">001199848-00001</td>
            </tr>
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="${labelStyle}">N° Cuenta Anterior:</td>
              <td class="value-col" style="${valueStyle} font-family: monospace, Courier, monospace; word-break: break-all;">013.0123275</td>
            </tr>
            <tr>
              <td class="label-col" style="${labelStyle}">Titular de Cuenta:</td>
              <td class="value-col" style="${valueStyle} font-weight: 700;">Martín CEDRÉS</td>
            </tr>
          </table>

          <div style="margin-top: 12px; padding: 10px 12px; background-color: #ffffff; border-radius: 10px; border-left: 4px solid #be123c; font-size: 12px; color: #881337; line-height: 1.5;">
            📲 <strong>Paso siguiente:</strong> Realiza la transferencia y envía el comprobante a nuestro WhatsApp <strong>098 615 074</strong> con el número de pedido <strong>#${orderId}</strong> para despachar tu paquete.
          </div>
        </div>
      `;
    case "oca_blue":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 10px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Depósito Digital</span>
          </div>
          <h4 style="margin: 0 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">💳 Datos para Depósito OCA Blue:</h4>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${tableBaseStyle}">
            <tr style="background-color: #ffe4e6; border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="padding: 8px 4px 8px 6px; width: 38%; color: #881337; font-weight: 800; vertical-align: middle;">N° Cuenta OCA Blue:</td>
              <td class="value-col" style="padding: 8px 6px 8px 4px; width: 62%; font-family: monospace, Courier, monospace; font-size: 15px; font-weight: 900; color: #be123c; vertical-align: middle; word-break: break-all;">0216811</td>
            </tr>
            <tr>
              <td class="label-col" style="${labelStyle}">Titular:</td>
              <td class="value-col" style="${valueStyle} font-weight: 700;">Martín Cedrés</td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #881337; line-height: 1.4;">
            📲 Envía el comprobante de depósito a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "prex":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 10px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Transferencia Prex</span>
          </div>
          <h4 style="margin: 0 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">💳 Datos para Transferencia Prex a Prex:</h4>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${tableBaseStyle}">
            <tr style="background-color: #ffe4e6; border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="padding: 8px 4px 8px 6px; width: 38%; color: #881337; font-weight: 800; vertical-align: middle;">N° Cuenta Prex:</td>
              <td class="value-col" style="padding: 8px 6px 8px 4px; width: 62%; font-family: monospace, Courier, monospace; font-size: 15px; font-weight: 900; color: #be123c; vertical-align: middle; word-break: break-all;">1216437</td>
            </tr>
            <tr>
              <td class="label-col" style="${labelStyle}">Titular:</td>
              <td class="value-col" style="${valueStyle} font-weight: 700;">Katherine Silva</td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #881337; line-height: 1.4;">
            📲 Envía la captura del traspaso a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "mi_dinero":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 10px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Mi Dinero</span>
          </div>
          <h4 style="margin: 0 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">💳 Datos para Transferencia Mi Dinero:</h4>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${tableBaseStyle}">
            <tr style="background-color: #ffe4e6; border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="padding: 8px 4px 8px 6px; width: 38%; color: #881337; font-weight: 800; vertical-align: middle;">N° Cuenta Mi Dinero:</td>
              <td class="value-col" style="padding: 8px 6px 8px 4px; width: 62%; font-family: monospace, Courier, monospace; font-size: 15px; font-weight: 900; color: #be123c; vertical-align: middle; word-break: break-all;">7537707</td>
            </tr>
            <tr>
              <td class="label-col" style="${labelStyle}">Titular:</td>
              <td class="value-col" style="${valueStyle} font-weight: 700;">Martín Cedrés</td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #881337; line-height: 1.4;">
            📲 Envía el comprobante a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "abitab":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 10px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Giro en Red de Cobranza</span>
          </div>
          <h4 style="margin: 0 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">📍 Instrucciones para Giro ABITAB:</h4>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${tableBaseStyle}">
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="${labelStyle}">Beneficiario:</td>
              <td class="value-col" style="${valueStyle} font-weight: 700;">Katherine SILVA</td>
            </tr>
            <tr style="background-color: #ffe4e6;">
              <td class="label-col" style="padding: 8px 4px 8px 6px; width: 38%; color: #881337; font-weight: 800; vertical-align: middle;">Cédula de Identidad:</td>
              <td class="value-col" style="padding: 8px 6px 8px 4px; width: 62%; font-family: monospace, Courier, monospace; font-size: 15px; font-weight: 900; color: #be123c; vertical-align: middle; word-break: break-all;">C.I. 4.798.217-8</td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #881337; line-height: 1.4;">
            📲 Envía la foto del ticket a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "red_pagos":
      return `
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 10px;">
            <span style="background-color: #be123c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Giro en Red de Cobranza</span>
          </div>
          <h4 style="margin: 0 0 10px 0; color: #881337; font-size: 15px; font-weight: 900;">📍 Instrucciones para Giro RED PAGOS:</h4>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${tableBaseStyle}">
            <tr style="border-bottom: 1px dashed #fecdd3;">
              <td class="label-col" style="${labelStyle}">Beneficiario:</td>
              <td class="value-col" style="${valueStyle} font-weight: 700;">Katherine SILVA</td>
            </tr>
            <tr style="background-color: #ffe4e6;">
              <td class="label-col" style="padding: 8px 4px 8px 6px; width: 38%; color: #881337; font-weight: 800; vertical-align: middle;">Cédula de Identidad:</td>
              <td class="value-col" style="padding: 8px 6px 8px 4px; width: 62%; font-family: monospace, Courier, monospace; font-size: 15px; font-weight: 900; color: #be123c; vertical-align: middle; word-break: break-all;">C.I. 4.798.217-8</td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #881337; line-height: 1.4;">
            📲 Envía la foto del ticket a nuestro WhatsApp <strong>098 615 074</strong> indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "efectivo":
      return `
        <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 8px;">
            <span style="background-color: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Pago Presencial</span>
          </div>
          <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 15px; font-weight: 900;">📍 Pago en Efectivo en Local:</h4>
          <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.5;">
            Puedes abonar en efectivo al retirar tu pedido en nuestro taller de San José de Mayo indicando el Pedido <strong>#${orderId}</strong>.
          </p>
        </div>
      `;
    case "mercado_pago_online":
      return `
        <div style="background-color: #f0f9ff; border: 1.5px solid #bae6fd; padding: 18px 16px; border-radius: 16px; margin-top: 18px;">
          <div style="margin-bottom: 8px;">
            <span style="background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block;">Mercado Pago Online</span>
          </div>
          <h4 style="margin: 0 0 8px 0; color: #075985; font-size: 15px; font-weight: 900;">💳 Pago con Tarjeta de Crédito / Débito:</h4>
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

    // Tabla HTML de productos solicitados para el COMPRADOR (4 columnas calibradas)
    let itemsRows = "";
    // Tabla HTML de productos para la TIENDA (3 columnas amplias)
    let adminItemsRows = "";

    if (Array.isArray(cart)) {
      cart.forEach((item: any, index: number) => {
        const itemTotal = (item.product.price * item.quantity).toLocaleString("es-UY");
        const isEven = index % 2 === 0;

        itemsRows += `
          <tr style="background-color: ${isEven ? "#ffffff" : "#fff1f2"}; border-bottom: 1px solid #fecdd3;">
            <td class="product-td" style="padding: 12px 8px; width: 44%; font-size: 13px; color: #0f172a; line-height: 1.4; vertical-align: middle; word-break: break-word;">
              <strong style="color: #4c0519;">${item.product.name}</strong>
            </td>
            <td class="product-td" style="padding: 12px 4px; width: 14%; font-size: 13px; color: #881337; text-align: center; font-weight: 800; vertical-align: middle;">
              ${item.quantity}&nbsp;u.
            </td>
            <td class="product-td" style="padding: 12px 6px; width: 19%; font-size: 12px; color: #475569; text-align: right; vertical-align: middle; white-space: nowrap;">
              $${item.product.price.toLocaleString("es-UY")}
            </td>
            <td class="product-td" style="padding: 12px 8px; width: 23%; font-size: 13px; font-weight: 900; color: #be123c; text-align: right; vertical-align: middle; white-space: nowrap;">
              $${itemTotal}&nbsp;UYU
            </td>
          </tr>
        `;

        adminItemsRows += `
          <tr style="background-color: ${isEven ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 10px; width: 50%; font-size: 13px; color: #0f172a; line-height: 1.4; vertical-align: middle; word-break: break-word;">
              <strong style="color: #0f172a;">${item.product.name}</strong>
            </td>
            <td style="padding: 12px 6px; width: 20%; font-size: 13px; color: #be123c; text-align: center; font-weight: 800; vertical-align: middle;">
              ${item.quantity}&nbsp;u.
            </td>
            <td style="padding: 12px 10px; width: 30%; font-size: 13px; font-weight: 800; color: #0f172a; text-align: right; vertical-align: middle; white-space: nowrap;">
              $${itemTotal}&nbsp;UYU
            </td>
          </tr>
        `;
      });
    }

    const isPickup = (shippingMethodName || "").toLowerCase().includes("retiro") || (customer?.address || "").toLowerCase().includes("retiro");

    const shippingClarification = isPickup
      ? `📍 <strong>Retiro Presencial:</strong> Te avisaremos por WhatsApp en cuanto tu pedido esté listo para retirar en nuestro local de San José de Mayo sin costo alguno.`
      : `🚚 <strong>Flete de Encomienda:</strong> El costo del envío por agencia (${shippingMethodName || "DAC / Correo"}) se abona directamente en destino al recibir o retirar tu paquete.`;

    const paymentInstructionsHTML = getPaymentInstructionsHTML(paymentMethodId || "", displayOrderId);

    // Enlace de WhatsApp preconfigurado
    const waCustomerLink = `https://wa.me/59898615074?text=${encodeURIComponent(
      `Hola Kamaluso, te escribo por el pedido #${displayOrderId} a nombre de ${customer?.name || "cliente"}`
    )}`;

    // 1. Email para el COMPRADOR (Recibo / Confirmación Oficial Kamaluso con Tablas y Media Queries Fluidas)
    const customerEmailHtml = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>Confirmación de Pedido #${displayOrderId} - Kamaluso</title>
        <style type="text/css">
          /* Reseteo para clientes de email */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #fce7f3; }

          /* Ajustes en pantallas pequeñas y smartphones */
          @media only screen and (max-width: 620px) {
            .email-outer-table {
              padding: 6px 4px !important;
            }
            .email-card {
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 16px !important;
            }
            .content-padding {
              padding: 18px 12px !important;
            }
            .header-padding {
              padding: 24px 12px 20px 12px !important;
            }
            .product-th, .product-td {
              padding: 10px 4px !important;
              font-size: 11px !important;
            }
            .mobile-btn {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              padding: 15px 10px !important;
              font-size: 13px !important;
              text-align: center !important;
            }
            .label-col {
              width: 38% !important;
              font-size: 12px !important;
            }
            .value-col {
              width: 62% !important;
              font-size: 12px !important;
            }
            .total-price {
              font-size: 21px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fce7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        
        <!-- Tabla Externa para Centrado Universal -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="email-outer-table" style="background-color: #fce7f3; width: 100%; margin: 0; padding: 20px 0;">
          <tr>
            <td align="center" style="padding: 0 8px;">

              <!-- Tarjeta Principal (Máximo 600px) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="email-card" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 22px; overflow: hidden; border: 2px solid #fecdd3; box-shadow: 0 10px 30px rgba(190, 18, 60, 0.12); margin: 0 auto;">
                
                <!-- Encabezado Oficial Kamaluso -->
                <tr>
                  <td align="center" class="header-padding" style="background: linear-gradient(135deg, #9f1239 0%, #be123c 45%, #e11d48 100%); background-color: #be123c; padding: 32px 20px 26px 20px; color: #ffffff; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fecdd3; font-weight: 800;">Fábrica de Papelería Sublimable</p>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.15); color: #ffffff;">KAMALUSO</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #ffe4e6; font-weight: 500;">San José de Mayo, Uruguay • Envíos a todo el país</p>
                    
                    <!-- Píldora Centrada con N° de Pedido -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 16px auto 0 auto;">
                      <tr>
                        <td align="center" style="background-color: #ffffff; border-radius: 25px; padding: 6px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.12);">
                          <span style="font-size: 13px; font-weight: 900; color: #be123c; letter-spacing: 0.5px;">PEDIDO #${displayOrderId}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contenido Principal -->
                <tr>
                  <td class="content-padding" style="padding: 26px 22px;">

                    <!-- Saludo -->
                    <p style="font-size: 17px; color: #0f172a; margin-top: 0; margin-bottom: 6px; font-weight: 800;">
                      ¡Hola, ${customer?.name || "Cliente"}! 🎉
                    </p>
                    <p style="font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 22px; line-height: 1.6;">
                      ¡Muchas gracias por elegirnos! Recibimos tu compra correctamente en nuestro taller. A continuación te presentamos el <strong>resumen detallado de tus insumos</strong> y las instrucciones para coordinar el envío.
                    </p>

                    <!-- Ficha de Datos de Entrega (Tabla Pura con Table-Layout Fixed) -->
                    <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 16px; padding: 16px; margin-bottom: 22px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #881337; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                        📍 DATOS DE ENTREGA Y DESTINO
                      </h3>
                      
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155; border-collapse: collapse; table-layout: fixed; margin: 0;">
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Destinatario:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 700; color: #0f172a; vertical-align: top; word-break: break-word;">${customer?.name || "-"}</td>
                        </tr>
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Teléfono:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 600; color: #0f172a; vertical-align: top; word-break: break-word;">${customer?.phone || "-"}</td>
                        </tr>
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Agencia / Método:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 800; color: #be123c; vertical-align: top; word-break: break-word;">${shippingMethodName || "-"}</td>
                        </tr>
                        <tr>
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Dirección / Destino:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 600; color: #0f172a; vertical-align: top; word-break: break-word;">${customer?.address || "-"}, ${customer?.city || "-"}, ${customer?.department || "-"}</td>
                        </tr>
                      </table>

                      <div style="margin-top: 12px; padding: 10px 12px; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 10px; font-size: 12px; color: #881337; line-height: 1.45;">
                        ${shippingClarification}
                      </div>
                    </div>

                    <!-- Tabla de Productos Solicitados -->
                    <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #881337; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                      📦 DETALLE DE PRODUCTOS SOLICITADOS
                    </h3>
                    
                    <div style="border: 2px solid #fecdd3; border-radius: 16px; overflow: hidden; margin-bottom: 22px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);">
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="product-table" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0;">
                        <thead>
                          <tr style="background: linear-gradient(135deg, #be123c 0%, #e11d48 100%); background-color: #be123c; color: #ffffff;">
                            <th class="product-th" style="padding: 10px 8px; width: 44%; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; text-align: left; vertical-align: middle;">Insumo</th>
                            <th class="product-th" style="padding: 10px 4px; width: 14%; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: center; vertical-align: middle;">Cant.</th>
                            <th class="product-th" style="padding: 10px 6px; width: 19%; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: right; vertical-align: middle;">Unitario</th>
                            <th class="product-th" style="padding: 10px 8px; width: 23%; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: right; vertical-align: middle;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsRows}
                        </tbody>
                      </table>

                      <!-- Desglose de Totales Basado en Tabla 100% Compatible (Cero Flexbox) -->
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fff1f2; border-top: 2px solid #fecdd3; width: 100%; margin: 0;">
                        <tr>
                          <td style="padding: 14px 16px 4px 16px; font-size: 13px; color: #64748b; vertical-align: middle;" align="left">
                            Subtotal Insumos:
                          </td>
                          <td style="padding: 14px 16px 4px 16px; font-size: 13px; font-weight: 700; color: #1e293b; vertical-align: middle;" align="right">
                            $${totalPrice.toLocaleString("es-UY")} UYU
                          </td>
                        </tr>
                        ${
                          isMp
                            ? `
                          <tr>
                            <td style="padding: 4px 16px 6px 16px; font-size: 13px; color: #be123c; vertical-align: middle;" align="left">
                              Comisión Mercado Pago (+10%):
                            </td>
                            <td style="padding: 4px 16px 6px 16px; font-size: 13px; font-weight: 700; color: #be123c; vertical-align: middle;" align="right">
                              +$${mpSurcharge.toLocaleString("es-UY")} UYU
                            </td>
                          </tr>
                        `
                            : ""
                        }
                        <tr>
                          <td colspan="2" style="padding: 4px 16px;">
                            <div style="border-top: 1.5px solid #fecdd3; font-size: 0; line-height: 0; height: 1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 16px 14px 16px; font-size: 14px; font-weight: 900; text-transform: uppercase; color: #4c0519; vertical-align: middle;" align="left">
                            Total a Pagar:
                          </td>
                          <td style="padding: 6px 16px 14px 16px; vertical-align: middle;" align="right">
                            <span class="total-price" style="font-size: 23px; font-weight: 900; color: #be123c; line-height: 1;">$${computedTotal.toLocaleString("es-UY")}</span>
                            <span style="font-size: 12px; font-weight: 800; color: #881337; margin-left: 2px;">UYU</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Ficha de Medio de Pago y Guía -->
                    <div style="margin-bottom: 22px;">
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 6px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 3px 0; font-size: 13px; color: #881337;">
                              <strong>Medio de Pago Seleccionado:</strong> <span style="color: #be123c; font-weight: 700;">${paymentMethodName || "-"}</span>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9f1239;">Fecha del Pedido: ${formattedDate}</p>
                          </td>
                        </tr>
                      </table>

                      ${paymentInstructionsHTML}
                    </div>

                    <!-- Botón de WhatsApp Kamaluso (Completamente Responsive) -->
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 28px; margin-bottom: 8px;">
                      <tr>
                        <td align="center">
                          <a href="${waCustomerLink}" class="mobile-btn" style="background-color: #16a34a; color: #ffffff; padding: 16px 28px; text-decoration: none; font-weight: 900; font-size: 14px; border-radius: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35); text-align: center; letter-spacing: 0.3px; max-width: 100%; box-sizing: border-box;">
                            📲 ENVIAR COMPROBANTE POR WHATSAPP (098 615 074)
                          </a>
                          <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                            Atención personalizada directa desde nuestro taller en San José de Mayo.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer con Identidad Kamaluso -->
                <tr>
                  <td align="center" style="background-color: #fff1f2; padding: 20px 16px; text-align: center; border-top: 2px solid #fecdd3; font-size: 12px; color: #881337;">
                    <p style="margin: 0 0 4px 0; font-weight: 900; color: #881337; font-size: 13px;">KAMALUSO SUBLIMACIÓN URUGUAY</p>
                    <p style="margin: 0 0 6px 0; color: #9f1239; font-size: 12px; line-height: 1.4;">Fabricantes directos de tapas de 350g, agendas, cuadernos y blocks para sublimadores.</p>
                    <p style="margin: 0; font-size: 12px;">
                      <a href="https://www.kamaluso.com" style="color: #be123c; text-decoration: none; font-weight: 800;">www.kamaluso.com</a> • WhatsApp: <strong>098 615 074</strong>
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

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
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Nuevo Pedido #${displayOrderId}</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0f172a; }

          @media only screen and (max-width: 620px) {
            .admin-outer-table {
              padding: 6px 4px !important;
            }
            .admin-card {
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 16px !important;
            }
            .admin-padding {
              padding: 18px 12px !important;
            }
            .admin-btn {
              display: block !important;
              width: 100% !important;
              box-sizing: border-box !important;
              padding: 14px 10px !important;
              font-size: 13px !important;
              text-align: center !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="admin-outer-table" style="background-color: #0f172a; width: 100%; margin: 0; padding: 20px 0;">
          <tr>
            <td align="center" style="padding: 0 8px;">

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="admin-card" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 2px solid #334155; margin: 0 auto;">
                
                <!-- Header Admin -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); background-color: #0f172a; padding: 26px 20px; text-align: center; color: #ffffff; border-bottom: 4px solid #be123c;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f472b6; font-weight: 800;">Panel de Ventas Kamaluso</p>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff;">🛍️ NUEVO PEDIDO #${displayOrderId}</h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">${formattedDate}</p>
                  </td>
                </tr>

                <!-- Contenido Admin -->
                <tr>
                  <td class="admin-padding" style="padding: 24px 20px;">

                    <!-- Ficha del Comprador -->
                    <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 16px; padding: 16px; margin-bottom: 20px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 12px; color: #881337; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                        👤 DATOS DEL CLIENTE / ENVÍO
                      </h3>
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155; border-collapse: collapse; table-layout: fixed; margin: 0;">
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Nombre/Empresa:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 800; color: #0f172a; vertical-align: top; word-break: break-word;">${customer?.name || "-"}</td>
                        </tr>
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Teléfono:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; vertical-align: top; word-break: break-word;">
                            <a href="tel:${customer?.phone}" style="color: #be123c; text-decoration: none; font-weight: 800;">${customer?.phone || "-"}</a>
                          </td>
                        </tr>
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Correo:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; vertical-align: top; word-break: break-all;">
                            <a href="mailto:${customer?.email}" style="color: #be123c; text-decoration: none; font-weight: 600;">${customer?.email || "-"}</a>
                          </td>
                        </tr>
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Agencia / Método:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 800; color: #be123c; vertical-align: top; word-break: break-word;">${shippingMethodName || "-"}</td>
                        </tr>
                        <tr style="border-bottom: 1px dashed #fecdd3;">
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Dirección / Destino:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 700; color: #0f172a; vertical-align: top; word-break: break-word;">${customer?.address || "-"}, ${customer?.city || "-"}, ${customer?.department || "-"}</td>
                        </tr>
                        <tr>
                          <td class="label-col" style="padding: 6px 4px 6px 0; width: 36%; font-weight: bold; color: #9f1239; vertical-align: top; word-break: break-word;">Método de Pago:</td>
                          <td class="value-col" style="padding: 6px 0 6px 4px; width: 64%; font-weight: 800; color: #166534; vertical-align: top; word-break: break-word;">${paymentMethodName || "-"}</td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 14px;">
                        <tr>
                          <td align="center">
                            <a href="https://wa.me/${waPhoneLink}?text=${encodeURIComponent(
                              `Hola ${customer?.name || ""}, te contactamos de Kamaluso Sublimación con respecto a tu pedido #${displayOrderId}.`
                            )}" class="admin-btn" style="background-color: #16a34a; color: #ffffff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block; max-width: 100%; box-sizing: border-box;">
                              💬 Escribir al Cliente por WhatsApp
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Insumos para Armado -->
                    <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
                      📦 PRODUCTOS A EMPACAR
                    </h3>
                    
                    <div style="border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 20px;">
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0;">
                        <thead>
                          <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 10px 10px; width: 50%; font-size: 11px; color: #475569; text-transform: uppercase; vertical-align: middle;">Insumo</th>
                            <th style="padding: 10px 6px; width: 20%; font-size: 11px; color: #475569; text-transform: uppercase; text-align: center; vertical-align: middle;">Cant.</th>
                            <th style="padding: 10px 10px; width: 30%; font-size: 11px; color: #475569; text-transform: uppercase; text-align: right; vertical-align: middle;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${adminItemsRows}
                        </tbody>
                      </table>

                      <!-- Total en Admin con Table Pura -->
                      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-top: 2px solid #334155; width: 100%; margin: 0;">
                        <tr>
                          <td style="padding: 14px 16px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; vertical-align: middle;" align="left">
                            Total del Pedido:
                          </td>
                          <td style="padding: 14px 16px; vertical-align: middle;" align="right">
                            <span style="font-size: 21px; font-weight: 900; color: #f472b6;">$${computedTotal.toLocaleString("es-UY")} UYU</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>

                <tr>
                  <td align="center" style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                    Kamaluso Sublimación • Sistema de Gestión de Taller
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

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
