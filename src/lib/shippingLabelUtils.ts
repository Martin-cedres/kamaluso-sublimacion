export type LabelPaperFormat = "a6" | "thermal100x150";
export type LabelColorMode = "color" | "bw";
export type LabelDeliveryType = "agencia" | "domicilio" | "local";

export const DEFAULT_FRAGILE_NOTE = "⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE";

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
 * Detecta si un segmento de texto proviene exclusivamente de registros internos de pago o sistema.
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
 * Extrae el RUT si viene incluido en las observaciones del checkout (ej. "RUT: 150754350013 • Notas...").
 */
export function extractRutFromObservations(observations?: string): string {
  if (!observations) return "";
  const match = observations.match(/\bRUT\s*:\s*([0-9.\-]+)/i);
  return match?.[1]?.trim() || "";
}

/**
 * Sanitiza las observaciones del cliente preservando indicaciones reales incluso cuando
 * el webhook de Mercado Pago añadió bloques técnicos como `[Pago MP #...]` en la misma cadena.
 */
export function cleanLabelObservations(observations?: string): string {
  if (!observations) return "";

  // 1. Quitar bloques técnicos entre corchetes (ej. [Pago MP #...], [Pedido manual ...])
  const withoutSystemBlocks = observations
    .replace(/\[(?:pago|pedido\s+manual|pedido\s+cargado)[^\]]*\]/gi, " ")
    .trim();

  if (!withoutSystemBlocks) return "";

  // 2. Dividir por separadores habituales del checkout ("•", "|", ";") y filtrar cada tramo
  const segments = withoutSystemBlocks
    .split(/\s*[•|;]\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => !isSystemOrPaymentNote(segment))
    // El RUT se muestra en su propio badge `rutInfo`, no dentro de la dirección
    .filter((segment) => !/^RUT\s*:/i.test(segment))
    .map((segment) =>
      segment
        .replace(/^(?:notas?\s*(?:de\s*)?domicilio|observaciones?|indicaciones?|empresa)\s*:\s*/i, "")
        .trim()
    )
    .filter(Boolean);

  return segments.join(" - ");
}

/**
 * Combina dirección base y observaciones entre paréntesis para mostrar en el campo de domicilio.
 */
export function formatAddressWithObservations(
  address: string,
  observations?: string
): {
  baseAddress: string;
  observations: string;
  combined: string;
} {
  const baseAddress = address.trim();
  const cleanObs = cleanLabelObservations(observations);
  if (!cleanObs) {
    return { baseAddress, observations: "", combined: baseAddress };
  }
  if (!baseAddress) {
    return { baseAddress: "", observations: cleanObs, combined: `(${cleanObs})` };
  }
  return {
    baseAddress,
    observations: cleanObs,
    combined: `${baseAddress} (${cleanObs})`,
  };
}
