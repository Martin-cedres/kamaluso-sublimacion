import { Customer, Order, resolveOrderShippingCost } from "@/types";
import { resolveShippingMethodNameFromCustomer } from "@/lib/customers";

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  const sanitized = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[;"\n]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

function downloadCsvFile(filename: string, headers: string[], rows: unknown[][]): void {
  if (typeof window === "undefined") return;

  const lines = [
    headers.map(escapeCsvCell).join(";"),
    ...rows.map((row) => row.map(escapeCsvCell).join(";")),
  ];

  // BOM UTF-8 (\uFEFF) para apertura directa con acentos en Microsoft Excel
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function getTodayTag(): string {
  return new Date().toISOString().slice(0, 10);
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  pago_confirmado: "Pago Confirmado",
  en_preparacion: "En Preparación",
  despachado: "Despachado",
  cancelado: "Cancelado",
};

export function exportOrdersToCsv(orders: Order[], suffix?: string): void {
  const headers = [
    "ID Pedido",
    "Fecha",
    "Estado",
    "Cliente",
    "Teléfono",
    "Email",
    "Departamento",
    "Ciudad",
    "Dirección",
    "Envío",
    "Medio de Pago",
    "Cant. Ítems",
    "Detalle Productos",
    "Subtotal Ítems (UYU)",
    "Descuento (UYU)",
    "Costo Envío (UYU)",
    "Total Final (UYU)",
    "Observaciones",
  ];

  const rows = orders.map((order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const totalQty = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    const itemsDetail = items
      .map((it) => `${it.product?.name || "Producto"} (x${it.quantity || 1})`)
      .join(", ");
    const shippingCost = resolveOrderShippingCost(order);
    const subtotal =
      typeof order.totalPrice === "number" && order.totalPrice > 0
        ? order.totalPrice
        : items.reduce(
            (sum, it) =>
              sum + (Number(it.product?.price) || 0) * (Number(it.quantity) || 0),
            0
          );

    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString("es-UY", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return [
      order.id,
      formattedDate,
      ORDER_STATUS_LABELS[order.status] || order.status,
      order.customer?.name || "",
      order.customer?.phone || "",
      order.customer?.email || "",
      order.customer?.department || "",
      order.customer?.city || "",
      order.customer?.address || "",
      order.shippingMethodName || "",
      order.paymentMethodName || "",
      totalQty,
      itemsDetail,
      subtotal,
      Number(order.discountAmount || 0),
      shippingCost,
      Number(order.finalTotal ?? subtotal),
      order.observations || order.customer?.observations || "",
    ];
  });

  const cleanSuffix = suffix ? suffix.replace(/[^a-zA-Z0-9_-]/g, "") : getTodayTag();
  downloadCsvFile(`kamaluso-pedidos-${cleanSuffix}.csv`, headers, rows);
}

export function exportCustomersToCsv(customers: Customer[]): void {
  const headers = [
    "ID Cliente",
    "Nombre / Empresa",
    "Teléfono",
    "WhatsApp (598)",
    "Email",
    "RUT / CI",
    "Departamento",
    "Ciudad",
    "Dirección / Sucursal",
    "Modalidad",
    "Envío Habitual",
    "Pedidos",
    "Total Invertido (UYU)",
    "Última Compra",
    "Observaciones Envío",
    "Notas Privadas Taller",
  ];

  const rows = customers.map((cust) => {
    const cleanPhone = (cust.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "");
    const waNumber = cleanPhone ? `598${cleanPhone}` : "";
    const lastOrder = cust.lastOrderAt
      ? new Date(cust.lastOrderAt).toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    return [
      cust.id,
      cust.name || "",
      cust.phone || "",
      waNumber,
      cust.email || "",
      cust.rutInfo || "",
      cust.department || "",
      cust.city || "",
      cust.address || "",
      cust.deliveryType || "",
      resolveShippingMethodNameFromCustomer(cust),
      cust.totalOrders || 0,
      cust.totalSpent || 0,
      lastOrder,
      cust.observations || "",
      cust.internalNotes || "",
    ];
  });

  downloadCsvFile(`kamaluso-clientes-${getTodayTag()}.csv`, headers, rows);
}
