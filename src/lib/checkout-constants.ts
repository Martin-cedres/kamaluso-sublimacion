export const URUGUAY_DEPARTMENTS = [
  "Montevideo",
  "San José",
  "Canelones",
  "Maldonado",
  "Colonia",
  "Salto",
  "Paysandú",
  "Rivera",
  "Tacuarembó",
  "Rocha",
  "Soriano",
  "Durazno",
  "Florida",
  "Lavalleja",
  "Artigas",
  "Cerro Largo",
  "Treinta y Tres",
  "Río Negro",
  "Flores",
] as const;

export const CUSTOMER_PAYMENT_METHODS = [
  { id: "brou", name: "Transferencia Bancaria BROU", badge: "Sin recargo" },
  { id: "prex", name: "Transferencia Prex a Prex", badge: "Sin recargo" },
  { id: "oca_blue", name: "Depósito OCA Blue", badge: "Sin recargo" },
  { id: "mi_dinero", name: "Mi Dinero", badge: "Sin recargo" },
  { id: "abitab", name: "Giro ABITAB", badge: "Sin recargo" },
  { id: "red_pagos", name: "Giro RED PAGOS", badge: "Sin recargo" },
  {
    id: "mercado_pago_online",
    name: "Tarjeta de Crédito / Débito (Mercado Pago)",
    badge: "+10% recargo",
  },
  {
    id: "efectivo",
    name: "Pago en Efectivo en Local",
    badge: "Solo retiro en taller",
  },
] as const;

export function stripAgencyPrefix(address?: string): string {
  if (!address) return "";
  return address.replace(/^Retiro en Sucursal:\s*/i, "").trim();
}

export function parseRutInfo(rutInfo?: string): {
  hasRut: boolean;
  rut: string;
  company: string;
} {
  const raw = (rutInfo || "").trim();
  if (!raw) {
    return { hasRut: false, rut: "", company: "" };
  }

  const parts = raw
    .split("•")
    .map((p) => p.trim())
    .filter(Boolean);

  let rut = "";
  let company = "";

  for (const part of parts) {
    if (/^rut\s*:/i.test(part)) {
      rut = part.replace(/^rut\s*:\s*/i, "").trim();
    } else if (/^(empresa|raz[oó]n\s*social)\s*:/i.test(part)) {
      company = part.replace(/^(empresa|raz[oó]n\s*social)\s*:\s*/i, "").trim();
    } else if (!rut && /^\d[\d.\-\s]{6,}$/.test(part)) {
      rut = part;
    } else if (!company) {
      company = part;
    }
  }

  if (!rut && !company) {
    rut = raw;
  }

  return {
    hasRut: Boolean(rut || company),
    rut,
    company,
  };
}

export function formatRutInfo(rut?: string, company?: string): string {
  const cleanRut = (rut || "").trim();
  const cleanCompany = (company || "").trim();
  return [
    cleanRut ? `RUT: ${cleanRut}` : "",
    cleanCompany ? `Empresa: ${cleanCompany}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
}
