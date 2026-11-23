"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Customer, Order, OrderStatus } from "@/types";
import {
  getOrdersForCustomer,
  getTopProductsForCustomer,
  registerOrUpdateCustomer,
  resolveShippingMethodNameFromCustomer,
  updateCustomerById,
} from "@/lib/customers";
import {
  X,
  ShoppingBag,
  Printer,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Truck,
  Lock,
  Save,
  Loader2,
  FileText,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Sparkles,
} from "lucide-react";

export interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: Order[];
  onNewOrder: (customer: Customer) => void;
  onPrintLabel: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onPrintOrderSummary: (order: Order) => void;
  onPrintOrderLabel: (order: Order) => void;
  onCustomerUpdated: (customer: Customer) => void;
}

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pendiente: {
    label: "⏳ Pendiente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  pago_confirmado: {
    label: "💳 Pago Confirmado",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  en_preparacion: {
    label: "📦 En Preparación",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  despachado: {
    label: "🚚 Despachado",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  cancelado: {
    label: "❌ Cancelado",
    className: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

export default function CustomerHistoryModal({
  isOpen,
  onClose,
  customer,
  orders,
  onNewOrder,
  onPrintLabel,
  onEditCustomer,
  onViewOrder,
  onEditOrder,
  onPrintOrderSummary,
  onPrintOrderLabel,
  onCustomerUpdated,
}: CustomerHistoryModalProps) {
  const [noteDraft, setNoteDraft] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !customer) return;
    setNoteDraft(customer.internalNotes || "");
    setNoteSavedFeedback(false);
    setNoteError(null);
  }, [isOpen, customer]);

  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return getOrdersForCustomer(customer, orders);
  }, [customer, orders]);

  const topProducts = useMemo(
    () => getTopProductsForCustomer(customerOrders),
    [customerOrders]
  );

  if (!isOpen || !customer) return null;

  const nonCancelledOrders = customerOrders.filter((o) => o.status !== "cancelado");
  const totalOrdersCount =
    customerOrders.length > 0 ? customerOrders.length : customer.totalOrders || 0;
  const computedSpentFromOrders = nonCancelledOrders.reduce(
    (sum, o) => sum + Number(o.finalTotal || o.totalPrice || 0),
    0
  );
  const totalSpentAmount =
    customerOrders.length > 0 ? computedSpentFromOrders : customer.totalSpent || 0;
  const avgTicket =
    nonCancelledOrders.length > 0
      ? Math.round(computedSpentFromOrders / nonCancelledOrders.length)
      : totalOrdersCount > 0
      ? Math.round(totalSpentAmount / totalOrdersCount)
      : 0;
  const lastPurchaseDateRaw =
    customerOrders[0]?.createdAt || customer.lastOrderAt || undefined;
  const lastPurchaseFormatted = lastPurchaseDateRaw
    ? new Date(lastPurchaseDateRaw).toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin compras";

  const cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "");
  const waUrl = cleanPhone ? `https://wa.me/598${cleanPhone}` : null;
  const shippingLabel = resolveShippingMethodNameFromCustomer(customer);
  const isFrequent = totalOrdersCount > 1;

  const handleSavePrivateNote = async () => {
    setIsSavingNote(true);
    setNoteSavedFeedback(false);
    setNoteError(null);

    try {
      const trimmedNote = noteDraft.trim();
      let saved: Customer | null = null;

      if (customer.id && !customer.id.startsWith("ORD-CUST-")) {
        saved = await updateCustomerById({
          id: customer.id,
          internalNotes: trimmedNote,
        });
      } else {
        saved = await registerOrUpdateCustomer({
          name: customer.name || "Cliente",
          phone: customer.phone || "",
          email: customer.email || "",
          department: customer.department || "Montevideo",
          city: customer.city || "",
          address: customer.address || "",
          deliveryType: customer.deliveryType,
          shippingCompany: customer.shippingCompany,
          shippingMethodName: customer.shippingMethodName,
          paymentMethodId: customer.paymentMethodId,
          observations: customer.observations,
          rutInfo: customer.rutInfo,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          lastOrderAt: customer.lastOrderAt,
          internalNotes: trimmedNote,
          explicitEdit: true,
          incrementOrder: false,
        });
      }

      if (!saved) {
        setNoteError("No se pudo guardar la nota privada.");
        return;
      }

      onCustomerUpdated(saved);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2500);
    } catch {
      setNoteError("Error de conexión al guardar la nota privada.");
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[45] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Oscuro */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-sky-600/25 border border-sky-400/40 text-sky-300 font-black text-base flex items-center justify-center shrink-0">
              {customer.name ? customer.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold truncate">
                  {customer.name || "Cliente Sin Nombre"}
                </h2>
                {isFrequent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-500/25 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Frecuente
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  {customer.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                {customer.phone && (
                  waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{customer.phone}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{customer.phone}</span>
                    </span>
                  )
                )}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 hover:underline truncate max-w-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{customer.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
            <button
              type="button"
              onClick={() => onNewOrder(customer)}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Nuevo Pedido</span>
            </button>
            <button
              type="button"
              onClick={() => onPrintLabel(customer)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-pink-400" />
              <span>Etiqueta</span>
            </button>
            <button
              type="button"
              onClick={() => onEditCustomer(customer)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Ficha</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Cerrar historial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs bg-slate-50/50">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Total Pedidos</span>
                <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-1">
                {totalOrdersCount}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Total Invertido</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-emerald-600 mt-1">
                ${totalSpentAmount.toLocaleString("es-UY")}{" "}
                <span className="text-[10px] font-bold text-slate-400">UYU</span>
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Ticket Promedio</span>
                <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-1">
                ${avgTicket.toLocaleString("es-UY")}{" "}
                <span className="text-[10px] font-bold text-slate-400">UYU</span>
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Última Compra</span>
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <p className="text-sm sm:text-base font-black text-slate-900 mt-1.5">
                {lastPurchaseFormatted}
              </p>
            </div>
          </div>

          {/* Datos Logísticos Habituales + Notas Privadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Datos logísticos habituales */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Datos Logísticos Habituales</span>
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Ubicación:</strong>{" "}
                    {[customer.city, customer.department]
                      .filter(Boolean)
                      .join(", ") || "Uruguay"}
                  </span>
                </p>
                <p>
                  <strong>Dirección / Sucursal:</strong>{" "}
                  {customer.address || "No especificada"}
                </p>
                <p>
                  <strong>Método habitual:</strong>{" "}
                  <span className="inline-block px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[11px] font-bold">
                    {shippingLabel}
                  </span>
                </p>
                {customer.rutInfo && (
                  <p>
                    <strong>RUT / CI:</strong>{" "}
                    <span className="font-mono font-bold">{customer.rutInfo}</span>
                  </p>
                )}
                {customer.observations && (
                  <p className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700">
                    <strong>Observaciones de envío:</strong> {customer.observations}
                  </p>
                )}
              </div>
            </div>

            {/* Bloque Notas Privadas de Taller */}
            <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-200/80 pb-2">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Notas Privadas de Taller</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300/70">
                    Solo visible en Admin • No sale en etiquetas ni A4
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Ej. Paga siempre por BROU, cliente mayorista habitual, prefiere tapas sueltas separadas..."
                  className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="min-h-[20px]">
                  {noteSavedFeedback && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ Nota guardada
                    </span>
                  )}
                  {noteError && (
                    <span className="text-[11px] font-bold text-rose-700">
                      {noteError}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSavePrivateNote}
                  disabled={isSavingNote}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {isSavingNote ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Guardar nota privada</span>
                </button>
              </div>
            </div>
          </div>

          {/* Productos más comprados */}
          {topProducts.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-pink-600" />
                <span>Productos Más Comprados</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {topProducts.slice(0, 10).map((prod) => (
                  <div
                    key={prod.productId + prod.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                  >
                    <span className="font-bold text-slate-800">{prod.name}</span>
                    <span className="font-mono font-black text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-md">
                      x{prod.totalQuantity} u.
                    </span>
                    <span className="text-slate-500 font-semibold">
                      (${prod.totalSpent.toLocaleString("es-UY")})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial Cronológico de Pedidos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Historial Cronológico de Pedidos ({customerOrders.length})</span>
              </h3>
            </div>

            {customerOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Este cliente aún no tiene pedidos registrados en el historial.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                      <th className="py-2.5 px-3">Pedido / Fecha</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Detalle de Ítems</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerOrders.map((order) => {
                      const statusMeta =
                        ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pendiente;
                      const itemsText =
                        Array.isArray(order.items) && order.items.length > 0
                          ? order.items
                              .map((i) => `${i.product.name} (x${i.quantity})`)
                              .join(", ")
                          : "Pedido sin detalle de ítems";

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-slate-900 block">
                              {order.id}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString("es-UY", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top text-slate-700 max-w-xs">
                            <p className="line-clamp-2 font-medium">{itemsText}</p>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {order.shippingMethodName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top text-right whitespace-nowrap font-black text-pink-600">
                            ${Number(order.finalTotal || order.totalPrice || 0).toLocaleString("es-UY")}{" "}
                            <span className="text-[10px] text-slate-400 font-semibold">
                              UYU
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onPrintOrderSummary(order)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 transition cursor-pointer"
                                title="Imprimir Nota de Pedido A4"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Nota A4</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onPrintOrderLabel(order)}
                                className="px-2 py-1 bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-700 border border-pink-200 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 transition cursor-pointer"
                                title="Imprimir Etiqueta 10x15"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Etiqueta</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onViewOrder(order)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Ver detalle del pedido"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onEditOrder(order)}
                                className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition cursor-pointer"
                                title="Editar pedido"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
