"use client";

import React from "react";
import Image from "next/image";
import { Order } from "@/types";
import { X, Printer, Truck, User, CreditCard, Calendar, Package } from "lucide-react";

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
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString("es-UY", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header (No Print) */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>Resumen de Pedido para Taller (A4)</span>
                <span className="text-xs bg-blue-500/25 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/40 font-mono">
                  #{order.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Formato estándar de packing / preparación interna para imprimir en hoja A4
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Hoja A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60 flex justify-center">
          {/* THE PRINTABLE SHEET (A4) */}
          <div
            id="printable-order-summary"
            className="bg-white text-slate-900 p-8 sm:p-10 w-full max-w-[800px] shadow-lg rounded-2xl border border-slate-200 print:border-none print:shadow-none font-sans space-y-6"
          >
            {/* Header de la Hoja de Pedido */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 relative flex-shrink-0">
                  <Image
                    src={LOGO_URL}
                    alt="Kamaluso Sublimación"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <h1 className="font-black text-2xl tracking-wider text-slate-950 uppercase leading-none">
                    KAMALUSO
                  </h1>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 mt-1">
                    Sublimación & Papelería Mayorista
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    San José de Mayo, Uruguay • WhatsApp: 098 615 074 • RUT 21.849.201.0018
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-black text-sm px-3 py-1 rounded-lg uppercase tracking-wider">
                  HOJA DE PREPARACIÓN
                </span>
                <p className="text-base font-mono font-black text-slate-900 mt-1">
                  PEDIDO #{order.id}
                </p>
                <p className="text-xs font-semibold text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate}</span>
                </p>
              </div>
            </div>

            {/* Fila 2 Columnas: Datos del Cliente y Datos Comerciales */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Columna Cliente */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 space-y-1.5">
                <h3 className="font-black text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Datos del Comprador</span>
                </h3>
                <p>
                  <strong className="text-slate-900">Nombre/Empresa:</strong>{" "}
                  <span className="font-bold text-slate-800 text-sm uppercase">
                    {order.customer.name}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Teléfono/WhatsApp:</strong>{" "}
                  <span className="font-mono font-bold text-slate-800">
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
                  <span className="font-bold text-slate-800">
                    {order.customer.city ? `${order.customer.city}, ` : ""}
                    {order.customer.department}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Dirección:</strong>{" "}
                  <span className="font-medium text-slate-700">
                    {order.customer.address || "Retiro en local"}
                  </span>
                </p>
              </div>

              {/* Columna Logística & Pago */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 space-y-1.5">
                <h3 className="font-black text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
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
                  <span className="font-bold text-slate-800">
                    {order.paymentMethodName}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Estado Pedido:</strong>{" "}
                  <span className="font-black uppercase px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 inline-block">
                    {order.status.replace("_", " ")}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Total Bultos/Unidades:</strong>{" "}
                  <span className="font-mono font-bold text-slate-800">
                    {totalQuantity} unidades
                  </span>
                </p>
              </div>
            </div>

            {/* Tabla de Artículos para Taller (Packing List) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Detalle de Artículos a Preparar</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
                </span>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-extrabold text-slate-700 text-[10px] uppercase">
                      <th className="p-2.5 text-center w-10">OK</th>
                      <th className="p-2.5 text-center w-8">#</th>
                      <th className="p-2.5">Producto & Especificaciones</th>
                      <th className="p-2.5 text-center w-20">Cant.</th>
                      <th className="p-2.5 text-right w-24">Precio Unit.</th>
                      <th className="p-2.5 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.items.map((item, index) => {
                      const itemSubtotal = item.product.price * item.quantity;
                      return (
                        <tr key={index} className="hover:bg-slate-50/80">
                          {/* Casilla de tildado para taller */}
                          <td className="p-2.5 text-center align-middle">
                            <div className="w-4 h-4 border-2 border-slate-400 rounded mx-auto"></div>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-500 align-middle">
                            {index + 1}
                          </td>
                          <td className="p-2.5 align-middle">
                            <p className="font-black text-slate-900 leading-snug">
                              {item.product.name}
                            </p>
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">
                                {Object.entries(item.selectedOptions)
                                  .map(([key, val]) => `${key}: ${val}`)
                                  .join(" • ")}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              SKU / ID: {item.product.id}
                            </p>
                          </td>
                          <td className="p-2.5 text-center align-middle">
                            <span className="font-mono font-black text-sm bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                              x{item.quantity}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700 align-middle">
                            ${item.product.price.toLocaleString("es-UY")} UYU
                          </td>
                          <td className="p-2.5 text-right font-mono font-black text-slate-900 align-middle">
                            ${itemSubtotal.toLocaleString("es-UY")} UYU
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen de Importes */}
            <div className="flex justify-end pt-2">
              <div className="w-72 bg-slate-50 p-3.5 rounded-xl border border-slate-300 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Subtotal Productos:</span>
                  <span className="font-mono">${order.totalPrice.toLocaleString("es-UY")} UYU</span>
                </div>
                {order.finalTotal !== order.totalPrice && (
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Recargo Medio de Pago:</span>
                    <span className="font-mono">
                      +${(order.finalTotal - order.totalPrice).toLocaleString("es-UY")} UYU
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-center">
                  <span className="font-black text-slate-900 uppercase text-xs">Total del Pedido:</span>
                  <span className="font-mono font-black text-base text-slate-950">
                    ${order.finalTotal.toLocaleString("es-UY")} UYU
                  </span>
                </div>
              </div>
            </div>

            {/* Espacio para Firma / Despacho */}
            <div className="border-t border-slate-300 pt-4">

              <div className="grid grid-cols-2 gap-6 pt-3 text-xs text-slate-600">
                <div>
                  <p className="border-b border-slate-400 pb-1 font-semibold">
                    Armado por: _____________________________
                  </p>
                </div>
                <div>
                  <p className="border-b border-slate-400 pb-1 font-semibold">
                    Firma / Fecha de Despacho: ________________
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS CSS PARA IMPRESIÓN EN HOJA A4 */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          html,
          body {
            width: 210mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-order-summary,
          #printable-order-summary * {
            visibility: visible !important;
          }
          #printable-order-summary {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
