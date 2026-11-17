export type LabelPaperFormat = "a6" | "thermal100x150";
export type LabelColorMode = "color" | "bw";
export type LabelDeliveryType = "agencia" | "domicilio" | "local";

export interface ShippingLabelPDFData {
  recipientName: string;
  recipientPhone: string;
  recipientDept: string;
  recipientCity: string;
  recipientAddress: string;
  shippingAgency: string;
  deliveryType?: LabelDeliveryType;
  observations?: string;
  rutInfo?: string;
  notes?: string;
  orderNumber?: string;
  senderName?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderWebsite?: string;
  senderRut?: string;
  printColorMode?: LabelColorMode;
  paperFormat?: LabelPaperFormat;
}

/**
 * Detecta si una nota proviene de registros automáticos de pago o del sistema.
 */
export function isSystemOrPaymentNote(text: string): boolean {
  if (!text) return false;
  const lower = text.trim().toLowerCase();
  return (
    lower.startsWith("[pago") ||
    lower.startsWith("[pedido manual") ||
    lower.startsWith("[pedido cargado") ||
    lower.includes("pago mp #") ||
    lower.includes("(approved)") ||
    lower.includes("(pending)") ||
    lower.includes("(rejected)") ||
    lower.includes("mercadopago") ||
    lower.includes("mercado pago")
  );
}

/**
 * Formatea Ciudad y Departamento evitando duplicados como "Montevideo, Montevideo".
 */
export function formatCityDeptDisplay(city?: string, dept?: string): string {
  const cleanCity = (city || "").trim();
  const cleanDept = (dept || "").trim();
  if (!cleanCity) return cleanDept || "Uruguay";
  if (cleanCity.toLowerCase() === cleanDept.toLowerCase()) return cleanDept;
  return `${cleanCity}, ${cleanDept}`;
}

/**
 * Estandariza el nombre de la agencia logística para la cabecera de la etiqueta.
 */
export function normalizeAgencyDisplay(shippingAgency?: string): string {
  const ag = (shippingAgency || "").trim();
  const lower = ag.toLowerCase();
  if (lower.includes("correo")) return "CORREO URUGUAYO";
  if (lower.includes("cotmi")) return "COTMI";
  if (lower.includes("dac")) return "DAC";
  if (lower.includes("local") || lower.includes("taller")) return "LOCAL";
  return ag.toUpperCase() || "DAC";
}

/**
 * Limpia el texto de dirección o sucursal quitando prefijos y notas incrustadas.
 */
export function cleanLabelAddress(address?: string): string {
  let clean = (address || "").trim();
  clean = clean.replace(/\[\s*(?:observaciones|notas|obs)[^\]]*\]/gi, "").trim();
  clean = clean.replace(/^Retiro en Sucursal:\s*/i, "");
  clean = clean.replace(/^Retiro en Agencia:\s*/i, "");
  clean = clean.replace(/^Sucursal:\s*/i, "");
  clean = clean.replace(/^Agencia:\s*/i, "");
  clean = clean.replace(/(?:notas?\s*domicilio|observaciones?|indicaciones?):\s*.*$/gi, "").trim();
  return clean;
}

/**
 * Sanitiza las observaciones del cliente descartando notas internas de pago y prefijos redundantes.
 */
export function cleanLabelObservations(observations?: string): string {
  if (!observations) return "";
  let obs = observations.trim();
  if (isSystemOrPaymentNote(obs)) return "";
  obs = obs.replace(/^(?:notas?\s*(?:de\s*)?domicilio|observaciones?|indicaciones?):\s*/i, "").trim();
  if (isSystemOrPaymentNote(obs)) return "";
  return obs;
}
