"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Printer, Truck, User, MapPin, Phone, Package, Building } from "lucide-react";

export interface ShippingLabelData {
  recipientName: string;
  recipientPhone: string;
  recipientDept: string;
  recipientCity: string;
  recipientAddress: string;
  shippingAgency: string;
  itemsSummary?: string;
  rutInfo?: string;
  notes?: string;
}

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ShippingLabelData;
}

const LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

export default function ShippingLabelModal({
  isOpen,
  onClose,
  initialData,
}: ShippingLabelModalProps) {
  // Remitente (Kamaluso)
  const [senderName, setSenderName] = useState("KAMALUSO SUBLIMACIÓN");
  const [senderPhone, setSenderPhone] = useState("098 615 074 (+598 98 615 074)");
  const [senderAddress, setSenderAddress] = useState("San José de Mayo, Uruguay");

  // Destinatario (Comprador)
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || "");
  const [recipientPhone, setRecipientPhone] = useState(initialData?.recipientPhone || "");
  const [recipientDept, setRecipientDept] = useState(initialData?.recipientDept || "Montevideo");
  const [recipientCity, setRecipientCity] = useState(initialData?.recipientCity || "");
  const [recipientAddress, setRecipientAddress] = useState(initialData?.recipientAddress || "");
  const [shippingAgency, setShippingAgency] = useState(
    initialData?.shippingAgency || "DAC (Agencia Central)"
  );
  const [itemsSummary, setItemsSummary] = useState(
    initialData?.itemsSummary || "Insumos de Papelería Sublimable / Agendas"
  );
  const [rutInfo, setRutInfo] = useState(initialData?.rutInfo || "");
  const [notes, setNotes] = useState(
    initialData?.notes || "⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE"
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-xl text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Generador e Impresión de Etiqueta de Envío
              </h3>
              <p className="text-xs text-slate-400">
                Formato listo para impresión (A6 / Térmica 10x15cm)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Form vs Printable Label */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side (Hidden when printing) */}
          <div className="lg:col-span-5 space-y-4 no-print border-r border-slate-100 pr-0 lg:pr-6">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <User className="w-4 h-4 text-pink-600" />
              <span>Datos del Destinatario</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nombre / Empresa *
                </label>
                <input
                  type="text"
                  placeholder="Ej. María García / Papelería Flores"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    placeholder="099 123 456"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Agencia / Empresa *
                  </label>
                  <select
                    value={shippingAgency}
                    onChange={(e) => setShippingAgency(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  >
                    <option value="DAC (Agencia Central)">DAC (Agencia Central)</option>
                    <option value="Correo Uruguayo">Correo Uruguayo</option>
                    <option value="Mirtrans / UES">Mirtrans / UES</option>
                    <option value="Turil / Nuñez">Turil / Nuñez</option>
                    <option value="Retiro en Local (San José)">Retiro en Local</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Departamento *
                  </label>
                  <select
                    value={recipientDept}
                    onChange={(e) => setRecipientDept(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  >
                    {[
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
                    ].map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ciudad / Localidad *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ciudad de la Costa"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Dirección o Agencia Destino *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Giannattasio km 22 o Agencia DAC Centro"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  RUT (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. RUT 210000000000"
                  value={rutInfo}
                  onChange={(e) => setRutInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Observaciones / Contenido
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider mt-4"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Etiqueta de Envío</span>
            </button>
          </div>

          {/* Printable Label Side */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-400 mb-2 no-print">
              Vista previa de la etiqueta lista para imprimir:
            </div>

            {/* THE PRINTABLE LABEL CONTAINER (Targeted by @media print) */}
            <div
              id="printable-shipping-label"
              className="printable-label-box bg-white text-slate-900 border-4 border-slate-900 rounded-2xl p-5 w-full max-w-[420px] shadow-xl space-y-4 font-sans relative"
            >
              {/* Header Etiqueta */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <Image
                      src={LOGO_URL}
                      alt="Kamaluso"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-black text-lg tracking-wider leading-none text-slate-900">
                      KAMALUSO
                    </h2>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      Sublimación & Papelería
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white font-black text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {shippingAgency || "ENVÍO NACIONAL"}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date().toLocaleDateString("es-UY")}
                  </p>
                </div>
              </div>

              {/* Remitente (Sender) Box */}
              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-300 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  REMITENTE:
                </span>
                <p className="font-extrabold text-slate-900 text-xs leading-snug">
                  {senderName}
                </p>
                <p className="text-[11px] text-slate-700">
                  Tel: {senderPhone} | {senderAddress}
                </p>
              </div>

              {/* Destinatario (Recipient) Box - LARGE & CLEAR */}
              <div className="p-3.5 bg-white rounded-xl border-2 border-slate-900 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="text-[10px] font-black uppercase text-pink-600 tracking-widest">
                    DESTINATARIO:
                  </span>
                  <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                    {recipientDept || "URUGUAY"}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight uppercase">
                    {recipientName || "[NOMBRE Y APELLIDO / EMPRESA]"}
                  </h3>
                  <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>{recipientPhone || "[TELÉFONO DE CONTACTO]"}</span>
                  </p>
                </div>

                <div className="pt-1 border-t border-slate-100 space-y-0.5">
                  <p className="text-xs font-black text-slate-900 uppercase">
                    📍 {recipientCity ? `${recipientCity}, ` : ""}{recipientDept}
                  </p>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {recipientAddress || "[DIRECCIÓN O SUCURSAL DE AGENCIA]"}
                  </p>
                </div>

                {rutInfo && (
                  <p className="text-[11px] font-bold text-slate-700 bg-slate-100 p-1.5 rounded mt-1">
                    📝 {rutInfo}
                  </p>
                )}
              </div>

              {/* Footer / Notes & Barcode Simulation */}
              <div className="pt-2 border-t-2 border-slate-900 flex items-center justify-between gap-2 text-[10px]">
                <div className="space-y-0.5 font-bold text-slate-700">
                  <p className="text-slate-900 font-extrabold uppercase">
                    📦 {itemsSummary}
                  </p>
                  <p className="text-red-600 font-extrabold">{notes}</p>
                </div>

                {/* Simulated Barcode */}
                <div className="flex flex-col items-end">
                  <div className="flex gap-0.5 h-6 items-center">
                    <div className="w-1 h-full bg-slate-900"></div>
                    <div className="w-0.5 h-full bg-slate-900"></div>
                    <div className="w-1.5 h-full bg-slate-900"></div>
                    <div className="w-0.5 h-full bg-slate-900"></div>
                    <div className="w-2 h-full bg-slate-900"></div>
                    <div className="w-1 h-full bg-slate-900"></div>
                    <div className="w-0.5 h-full bg-slate-900"></div>
                    <div className="w-1.5 h-full bg-slate-900"></div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-slate-500">
                    KM-LABEL-{Date.now().toString().slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS PRINT STYLES FOR CLEAN LABEL PRINTING */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-shipping-label,
          #printable-shipping-label * {
            visibility: visible !important;
          }
          #printable-shipping-label {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-w-none !important;
            border: 4px solid #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
