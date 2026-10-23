"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Order } from "@/types";
import {
  X,
  Printer,
  Truck,
  User,
  Calendar,
  Package,
  FileText,
} from "lucide-react";

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

export default function OrderSummaryModal({
  isOpen,
  onClose,
  order,
}: OrderSummaryModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = useMemo(() => {
    if (!order?.createdAt) return "";
    return new Date(order.createdAt).toLocaleString("es-UY", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [order?.createdAt]);

  const totalQuantity = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((acc, item) => acc + item.quantity, 0);
  }, [order?.items]);

  const cityDeptDisplay = useMemo(() => {
    if (!order?.customer) return "Uruguay";
    const city = (order.customer.city || "").trim();
    const dept = (order.customer.department || "").trim();
    if (!city) return dept || "Uruguay";
    if (city.toLowerCase() === dept.toLowerCase()) return dept;
    return `${city}, ${dept}`;
  }, [order?.customer]);

  // Early return DESPUÉS de los hooks (Rules of Hooks)
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:m-0 print:bg-transparent">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0 print:m-0">
        {/* Modal Header (No Print) */}
        <div className="relative px-4 sm:px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 pr-14 no-print border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-base sm:text-lg leading-tight flex flex-wrap items-center gap-2">
                <span className="whitespace-nowrap">Nota de Pedido (A4)</span>
                <span className="text-[11px] bg-blue-500/25 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/40 font-mono whitespace-nowrap">
                  #{order.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Hoja de preparación para taller</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Imprimir Hoja A4 */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir A4</span>
            </button>
          </div>

          {/* Cerrar: anclado arriba a la derecha */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Printable Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-slate-100/60 print:p-0 print:m-0 print:overflow-visible print:bg-white">
          {/* THE PRINTABLE SHEET (A4) */}
          <div
            id="printable-order-summary"
            className="bg-white text-slate-900 p-6 sm:p-8 w-full max-w-[800px] mx-auto shadow-xl rounded-2xl border border-slate-200 font-sans print:p-0 print:m-0 print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none space-y-3.5"
          >
            {/* 1. Header de la Hoja de Pedido A4 */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative flex-shrink-0">
                  <Image
                    src={LOGO_URL}
                    alt="Kamaluso Sublimación"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <h1 className="font-black text-xl tracking-wider text-slate-950 uppercase leading-none">
                    KAMALUSO
                  </h1>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600 mt-1">
                    Sublimación & Papelería Mayorista
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">
                    San José de Mayo, Uruguay • WhatsApp: 098 615 074 • www.kamaluso.com
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-black text-xs px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                  HOJA DE PREPARACIÓN
                </span>
                <p className="text-sm font-mono font-black text-slate-900 mt-0.5">
                  PEDIDO #{order.id}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formattedDate}</span>
                </p>
              </div>
            </div>

            {/* 2. Fila 2 Columnas: Datos del Comprador y Logística / Pago */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Columna Cliente */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 space-y-1">
                <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <User className="w-3 h-3 text-blue-600" />
                  <span>Datos del Comprador</span>
                </h3>
                <p>
                  <strong className="text-slate-900">Nombre/Empresa:</strong>{" "}
                  <span className="font-bold text-slate-900 text-xs uppercase">
                    {order.customer.name}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Teléfono/WhatsApp:</strong>{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {order.customer.phone}
                  </span>
                </p>
                {order.customer.email && (
                  <p>
                    <strong className="text-slate-900">Email:</strong>{" "}
                    <span className="text-slate-700">{order.customer.email}</span>
                  </p>
                )}
                <p>
                  <strong className="text-slate-900">Destino:</strong>{" "}
                  <span className="font-bold text-slate-800">{cityDeptDisplay}</span>
                </p>
                <p>
                  <strong className="text-slate-900">Dirección / Sucursal:</strong>{" "}
                  <span className="font-semibold text-slate-800">
                    {order.customer.address || "Retiro en local"}
                  </span>
                </p>
              </div>

              {/* Columna Logística & Pago */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 space-y-1">
                <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <Truck className="w-3 h-3 text-blue-600" />
                  <span>Logística y Pago</span>
                </h3>
                <p>
                  <strong className="text-slate-900">Forma de Envío:</strong>{" "}
                  <span className="font-bold text-blue-700 uppercase">
                    {order.shippingMethodName}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Medio de Pago:</strong>{" "}
                  <span className="font-bold text-slate-900">
                    {order.paymentMethodName}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Estado Pedido:</strong>{" "}
                  <span className="font-black uppercase px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-800 inline-block">
                    {order.status.replace("_", " ")}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Total Bultos/Unidades:</strong>{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {totalQuantity} unidades ({order.items.length}{" "}
                    {order.items.length === 1 ? "ítem" : "ítems"})
                  </span>
                </p>
              </div>
            </div>

            {/* 3. Tabla de Artículos para Taller (Packing List) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  <span>Detalle de Artículos a Preparar en Taller</span>
                </h3>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-extrabold text-slate-700 text-[9px] uppercase">
                      <th className="p-2 text-center w-10">OK</th>
                      <th className="p-2">Producto & Especificaciones</th>
                      <th className="p-2 text-center w-16">Cant.</th>
                      <th className="p-2 text-right w-24">Precio Unit.</th>
                      <th className="p-2 text-right w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {order.items.map((item, index) => {
                      const itemSubtotal = item.product.price * item.quantity;
                      return (
                        <tr key={index} className="hover:bg-slate-50/80">
                          {/* Casilla de tildado para taller */}
                          <td className="p-2 text-center align-middle">
                            <div className="w-4 h-4 border-2 border-slate-400 rounded mx-auto"></div>
                          </td>
                          <td className="p-2 align-middle">
                            <p className="font-black text-slate-900 text-xs leading-tight">
                              {item.product.name}
                            </p>
                            {item.selectedOptions &&
                              Object.keys(item.selectedOptions).length > 0 && (
                                <p className="text-[9px] font-semibold text-slate-600 mt-0.5">
                                  {Object.entries(item.selectedOptions)
                                    .map(([key, val]) => `${key}: ${val}`)
                                    .join(" • ")}
                                </p>
                              )}
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                              SKU: {item.product.id}
                            </p>
                          </td>
                          <td className="p-2 text-center align-middle">
                            <span className="font-mono font-black text-xs bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                              x{item.quantity}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono text-slate-700 text-xs align-middle">
                            ${item.product.price.toLocaleString("es-UY")} UYU
                          </td>
                          <td className="p-2 text-right font-mono font-black text-slate-950 text-xs align-middle">
                            ${itemSubtotal.toLocaleString("es-UY")} UYU
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Resumen de Importes y Observaciones */}
            <div className="flex justify-between items-start gap-3 pt-1">
              {/* Observaciones del Cliente */}
              <div className="flex-1">
                {order.customer.observations ? (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-xs">
                    <p className="font-bold text-amber-900 text-[10px] uppercase tracking-wider">
                      Observaciones del Cliente:
                    </p>
                    <p className="text-slate-900 text-xs font-semibold mt-0.5 leading-snug">
                      {order.customer.observations}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 text-[10px] text-slate-400 italic border border-dashed border-slate-200 rounded-xl">
                    Sin observaciones adicionales del cliente.
                  </div>
                )}
              </div>

              {/* Caja de Importes */}
              <div className="w-60 bg-slate-50 p-2.5 rounded-xl border border-slate-300 space-y-1 text-xs flex-shrink-0">
                <div className="flex justify-between text-slate-600 font-semibold text-[10px]">
                  <span>Subtotal Insumos:</span>
                  <span className="font-mono font-bold">
                    ${order.totalPrice.toLocaleString("es-UY")} UYU
                  </span>
                </div>
                {order.finalTotal !== order.totalPrice && (
                  <div className="flex justify-between text-slate-600 font-semibold text-[10px]">
                    <span>Recargo Medio de Pago:</span>
                    <span className="font-mono font-bold">
                      +${(order.finalTotal - order.totalPrice).toLocaleString("es-UY")} UYU
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-slate-900 pt-1 flex justify-between items-center">
                  <span className="font-black text-slate-900 uppercase text-[11px]">
                    Total Pedido:
                  </span>
                  <span className="font-mono font-black text-base text-slate-950">
                    ${order.finalTotal.toLocaleString("es-UY")} UYU
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS CSS ESTRICTOS PARA IMPRESIÓN EN HOJA A4 (210 x 297 mm) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait !important;
              margin: 0mm !important;
            }
            @media print {
              html,
              body {
                width: 210mm !important;
                height: 297mm !important;
                max-width: 210mm !important;
                max-height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              .no-print,
              .no-print * {
                display: none !important;
              }
              #printable-order-summary,
              #printable-order-summary * {
                visibility: visible !important;
              }
              #printable-order-summary {
                position: absolute !important;
                left: 8mm !important;
                top: 8mm !important;
                width: 194mm !important;
                max-width: 194mm !important;
                height: auto !important;
                max-height: 281mm !important;
                min-height: 0 !important;
                box-sizing: border-box !important;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #0f172a !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
                break-before: avoid !important;
                z-index: 999999 !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
