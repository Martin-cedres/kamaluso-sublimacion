import { CartItem } from "@/types";

// Número de WhatsApp oficial de Kamaluso (San José, Uruguay: 098615074)
export const KAMALUSO_WHATSAPP = "59898615074";


/**
 * Obtiene las instrucciones de pago formateadas para WhatsApp según el medio seleccionado
 */
export function getPaymentInstructions(paymentMethodId: string, orderId?: string): string {
  const orderRef = orderId ? ` (Ref. Pedido #${orderId})` : "";

  switch (paymentMethodId) {
    case "brou":
      return (
        `🏦 *DATOS PARA TRANSFERENCIA BROU:*${orderRef}\n` +
        `• *Banco:* BROU (Banco República)\n` +
        `• *Tipo de Cuenta:* Caja de Ahorro en Pesos (UYU)\n` +
        `• *N° Cuenta Actual:* 001199848-00001\n` +
        `• *N° Cuenta Anterior:* 013.0123275\n` +
        `• *Titular:* Martín Cedrés\n` +
        `📲 _Por favor envía el comprobante por este chat para procesar tu pedido._`
      );

    case "oca_blue":
      return (
        `💳 *DATOS PARA DEPÓSITO OCA BLUE:*${orderRef}\n` +
        `• *N° Cuenta OCA Blue:* 0216811\n` +
        `• *Titular:* Martín Cedrés\n` +
        `📲 _Por favor envía el comprobante de depósito por este chat para procesar tu pedido._`
      );

    case "prex":
      return (
        `💳 *DATOS PARA TRANSFERENCIA PREX A PREX:*${orderRef}\n` +
        `• *N° Cuenta Prex:* 1216437\n` +
        `• *Titular:* Katherine Silva\n` +
        `📲 _Por favor envía la captura del traspaso por este chat para procesar tu pedido._`
      );

    case "mi_dinero":
      return (
        `💳 *DATOS PARA TRANSFERENCIA MI DINERO:*${orderRef}\n` +
        `• *N° Cuenta Mi Dinero:* 7537707\n` +
        `• *Titular:* Martín Cedrés\n` +
        `📲 _Por favor envía el comprobante por este chat para procesar tu pedido._`
      );

    case "abitab":
      return (
        `📍 *INSTRUCCIONES PARA GIRO ABITAB:*${orderRef}\n` +
        `• *Cédula de Identidad:* C.I. 4.798.217-8\n` +
        `• *Beneficiario:* Katherine Silva\n` +
        `📲 _Por favor envía la foto del ticket de Abitab por este chat para procesar tu pedido._`
      );

    case "red_pagos":
      return (
        `📍 *INSTRUCCIONES PARA GIRO RED PAGOS:*${orderRef}\n` +
        `• *Cédula de Identidad:* C.I. 4.798.217-8\n` +
        `• *Beneficiario:* Katherine Silva\n` +
        `📲 _Por favor envía la foto del ticket de Red Pagos por este chat para procesar tu pedido._`
      );

    case "efectivo":
      return (
        `💵 *PAGO EN EFECTIVO EN LOCAL:*${orderRef}\n` +
        `• Retiras y abonas directamente en nuestro local de San José de Mayo sin costo extra.\n` +
        `📲 _Te avisaremos por este chat en cuanto tu pedido esté listo para retirar._`
      );

    case "mercado_pago_online":
      return (
        `💳 *PAGO CON TARJETA (MERCADO PAGO):*${orderRef}\n` +
        `• Abonado mediante tarjeta online (+10% recargo).\n` +
        `📲 _Una vez confirmado el pago en el sistema, comenzaremos con la preparación de tu pedido._`
      );

    default:
      return (
        `💳 *MÉTODO DE PAGO:* ${paymentMethodId}\n` +
        `📲 _Por favor indícanos si precisas los datos bancarios para realizar la transferencia._`
      );
  }
}

export function buildWhatsAppUrl(cartItems: CartItem[]): string {
  if (cartItems.length === 0) return "#";

  let message = `*¡Hola Kamaluso! Quisiera realizar el siguiente pedido de papelería sublimable:*\n\n`;

  let total = 0;

  cartItems.forEach((item, index) => {
    const subtotal = item.product.price * item.quantity;
    total += subtotal;
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   • Cantidad: ${item.quantity} unid.\n`;
    message += `   • Precio: $${item.product.price} UYU c/u\n`;
    message += `   • Subtotal: $${subtotal} UYU\n\n`;
  });

  message += `------------------------------------\n`;
  message += `💰 *TOTAL ESTIMADO: $${total} UYU*\n`;
  message += `------------------------------------\n\n`;
  message += `📌 *Nota:* Sin mínimo de compra. Despacho coordinado a todo el país. La elaboración comenzará luego de enviar el comprobante de pago.\n\n`;
  message += `Por favor confírmenme disponibilidad de stock y datos para realizar el pago. ¡Muchas gracias!`;

  return `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
