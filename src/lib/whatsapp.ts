import { CartItem } from "@/types";

// Número de WhatsApp oficial de Kamaluso (San José, Uruguay: 098615074)
export const KAMALUSO_WHATSAPP = "59898615074";


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
  message += `📌 *Nota:* Sin mínimo de compra. La elaboración comenzará luego de enviar el comprobante de pago (Abitab, Redpagos, BROU, Prex, MercadoPago).\n\n`;
  message += `Por favor confírmenme disponibilidad de stock y datos para realizar el pago. ¡Muchas gracias!`;


  return `https://wa.me/${KAMALUSO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
