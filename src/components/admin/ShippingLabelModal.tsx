"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Order } from "@/types";
import {
  X,
  Printer,
  Truck,
  User,
  MapPin,
  Phone,
  Package,
  Building,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

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
  orderNumber?: string;
  packageCount?: string;
  freightCondition?: "destino" | "pago";
}

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  initialData?: ShippingLabelData;
}

const LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

export default function ShippingLabelModal({
  isOpen,
  onClose,
  order,
  initialData,
}: ShippingLabelModalProps) {
  // Remitente (Kamaluso) - 100% Editable
  const [senderName, setSenderName] = useState("KAMALUSO SUBLIMACIÓN");
  const [senderPhone, setSenderPhone] = useState("098 615 074");
  const [senderAddress, setSenderAddress] = useState("San José de Mayo, Uruguay");
  const [senderRut, setSenderRut] = useState("RUT 21.849.201.0018");

  // Destinatario - 100% Editable
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientDept, setRecipientDept] = useState("Montevideo");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [rutInfo, setRutInfo] = useState("");

  // Logística y Paquete - 100% Editable
  const [shippingAgency, setShippingAgency] = useState("DAC (Agencia Central)");
  const [deliveryType, setDeliveryType] = useState("A Domicilio");
  const [packageCount, setPackageCount] = useState("1 Bulto");
  const [freightCondition, setFreightCondition] = useState<"destino" | "pago">("destino");
  const [orderNumber, setOrderNumber] = useState("");
  const [itemsSummary, setItemsSummary] = useState("Insumos de Papelería Sublimable");
  const [notes, setNotes] = useState("⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE");

  // Estado de copiado
  const [copied, setCopied] = useState(false);

  // Sincronizar datos automáticamente cada vez que se abre con un pedido o se pasa un initialData
  useEffect(() => {
    if (order) {
      setRecipientName(order.customer.name || "");
      setRecipientPhone(order.customer.phone || "");
      setRecipientDept(order.customer.department || "Montevideo");
      setRecipientCity(order.customer.city || "");
      setRecipientAddress(order.customer.address || "");
      setOrderNumber(order.id || `KAM-${Date.now().toString().slice(-6)}`);

      // Determinar agencia a partir del método de envío del pedido
      const shipName = order.shippingMethodName || "";
      if (shipName.toLowerCase().includes("dac")) {
        setShippingAgency("DAC (Agencia Central)");
        setDeliveryType(shipName.toLowerCase().includes("agencia") ? "Retiro en Agencia" : "A Domicilio");
      } else if (shipName.toLowerCase().includes("correo")) {
        setShippingAgency("Correo Uruguayo");
        setDeliveryType("Retiro en Sucursal");
      } else if (shipName.toLowerCase().includes("retiro") || shipName.toLowerCase().includes("local")) {
        setShippingAgency("Retiro en Local (San José)");
        setDeliveryType("Retiro Presencial");
      } else {
        setShippingAgency(shipName || "DAC (Agencia Central)");
        setDeliveryType("A Domicilio");
      }

      // Resumen de productos
      if (order.items && order.items.length > 0) {
        const summary = order.items
          .map((item) => `${item.product.name} (x${item.quantity})`)
          .join(", ");
        setItemsSummary(summary.length > 90 ? `${summary.slice(0, 87)}...` : summary);
        setPackageCount(`${order.items.reduce((acc, i) => acc + i.quantity, 0)} u. (1 Bulto)`);
      } else {
        setItemsSummary("Insumos de Papelería Sublimable");
        setPackageCount("1 Bulto");
      }

      setFreightCondition(shipName.toLowerCase().includes("retiro") ? "pago" : "destino");
    } else if (initialData) {
      setRecipientName(initialData.recipientName || "");
      setRecipientPhone(initialData.recipientPhone || "");
      setRecipientDept(initialData.recipientDept || "Montevideo");
      setRecipientCity(initialData.recipientCity || "");
      setRecipientAddress(initialData.recipientAddress || "");
      setShippingAgency(initialData.shippingAgency || "DAC (Agencia Central)");
      setItemsSummary(initialData.itemsSummary || "Insumos de Papelería Sublimable");
      setRutInfo(initialData.rutInfo || "");
      setNotes(initialData.notes || "⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE");
      setOrderNumber(initialData.orderNumber || `KAM-${Date.now().toString().slice(-6)}`);
      setPackageCount(initialData.packageCount || "1 Bulto");
      setFreightCondition(initialData.freightCondition || "destino");
    } else {
      // Valores por defecto para etiqueta manual
      setRecipientName("");
      setRecipientPhone("");
      setRecipientDept("Montevideo");
      setRecipientCity("");
      setRecipientAddress("");
      setShippingAgency("DAC (Agencia Central)");
      setDeliveryType("A Domicilio");
      setItemsSummary("Insumos de Papelería Sublimable / Agendas");
      setRutInfo("");
      setNotes("⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE");
      setOrderNumber(`KAM-${Date.now().toString().slice(-6)}`);
      setPackageCount("1 Bulto");
      setFreightCondition("destino");
    }
  }, [order, initialData, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (order) {
      setRecipientName(order.customer.name || "");
      setRecipientPhone(order.customer.phone || "");
      setRecipientDept(order.customer.department || "Montevideo");
      setRecipientCity(order.customer.city || "");
      setRecipientAddress(order.customer.address || "");
      setOrderNumber(order.id);
    }
  };

  const handleCopyText = () => {
    const text = `*DATOS PARA ENVÍO - KAMALUSO*\n` +
      `📦 *N° Pedido:* ${orderNumber}\n` +
      `🚚 *Agencia:* ${shippingAgency} (${deliveryType})\n` +
      `💵 *Flete:* ${freightCondition === "destino" ? "A PAGAR EN DESTINO" : "FLETE PAGO"}\n\n` +
      `👤 *DESTINATARIO:*\n` +
      `• *Nombre:* ${recipientName}\n` +
      `• *Teléfono:* ${recipientPhone}\n` +
      `• *Destino:* ${recipientAddress}, ${recipientCity}, ${recipientDept}\n` +
      (rutInfo ? `• *RUT/CI:* ${rutInfo}\n` : "") +
      `• *Bultos:* ${packageCount}\n` +
      `• *Contenido:* ${itemsSummary}\n` +
      `• *Observación:* ${notes}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-600 rounded-2xl text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>Generador de Etiquetas de Envío</span>
                {orderNumber && (
                  <span className="text-xs bg-pink-500/25 text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-500/40 font-mono">
                    #{orderNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                100% editable • Formato estándar de logística (A6 / Térmica 10x15cm)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Form vs Printable Label */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side (Hidden during print) */}
          <div className="lg:col-span-6 space-y-4 no-print border-r border-slate-100 pr-0 lg:pr-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-pink-600" />
                <span>Campos Editables de la Etiqueta</span>
              </h4>
              {order && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-slate-500 hover:text-pink-600 flex items-center gap-1 font-bold transition"
                  title="Restablecer a datos originales del pedido"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              )}
            </div>

            {/* SECCIÓN 1: DESTINATARIO */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                1. Destinatario (Comprador)
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Nombre Completo / Empresa *
                </label>
                <input
                  type="text"
                  placeholder="Ej. María García / Imprenta San José"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Teléfono / Celular *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 099 123 456"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    RUT / CI (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. RUT 210000000000"
                    value={rutInfo}
                    onChange={(e) => setRutInfo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Departamento *
                  </label>
                  <select
                    value={recipientDept}
                    onChange={(e) => setRecipientDept(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Ciudad / Localidad *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ciudad de la Costa"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Dirección de Domicilio o Sucursal de Retiro *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. 18 de Julio 1234 Apto 201 o Agencia DAC Centro"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* SECCIÓN 2: LOGÍSTICA Y TRANSPORTE */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                2. Transporte y Encomienda
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Empresa / Agencia *
                  </label>
                  <input
                    type="text"
                    placeholder="DAC / Correo / Mirtrans / Turil"
                    value={shippingAgency}
                    onChange={(e) => setShippingAgency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Modalidad
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  >
                    <option value="A Domicilio">A Domicilio</option>
                    <option value="Retiro en Sucursal">Retiro en Sucursal</option>
                    <option value="Retiro Presencial">Retiro en Local San José</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Condición Flete
                  </label>
                  <select
                    value={freightCondition}
                    onChange={(e) => setFreightCondition(e.target.value as "destino" | "pago")}
                    className={`w-full px-2 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-pink-500 focus:outline-none ${
                      freightCondition === "destino"
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-emerald-50 text-emerald-900 border-emerald-300"
                    }`}
                  >
                    <option value="destino">A Pagar en Destino</option>
                    <option value="pago">Flete Pago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Cant. Bultos
                  </label>
                  <input
                    type="text"
                    placeholder="1 Bulto"
                    value={packageCount}
                    onChange={(e) => setPackageCount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    N° Pedido
                  </label>
                  <input
                    type="text"
                    placeholder="KAM-123456"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-pink-600 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Contenido Declarado
                </label>
                <input
                  type="text"
                  value={itemsSummary}
                  onChange={(e) => setItemsSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Leyenda / Advertencia
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-red-600 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* SECCIÓN 3: REMITENTE */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                3. Remitente (Kamaluso)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nombre</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Teléfono</label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3.5 px-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Etiqueta</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl border border-slate-300 flex items-center justify-center gap-1.5 text-xs transition"
                title="Copiar datos para enviar por WhatsApp al fletero"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copiado" : "Copiar Texto"}</span>
              </button>
            </div>
          </div>

          {/* Printable Label Preview Side */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100/70 p-3 sm:p-5 rounded-3xl border border-slate-200">
            <div className="text-xs font-bold text-slate-500 mb-3 no-print flex items-center gap-2">
              <span>Vista previa en vivo (se actualiza mientras editas):</span>
            </div>

            {/* THE PRINTABLE LABEL (Targeted by @media print) */}
            <div
              id="printable-shipping-label"
              className="printable-label-box bg-white text-slate-900 border-[3.5px] border-black rounded-2xl p-5 w-full max-w-[440px] shadow-xl space-y-3 font-sans relative"
              style={{ minHeight: "560px" }}
            >
              {/* Header Etiqueta con Logo Kamaluso y Agencia */}
              <div className="flex items-center justify-between border-b-[2.5px] border-black pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 relative flex-shrink-0">
                    <Image
                      src={LOGO_URL}
                      alt="Kamaluso"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h2 className="font-black text-xl tracking-wider leading-none text-black">
                      KAMALUSO
                    </h2>
                    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">
                      Sublimación & Papelería
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-black text-white font-black text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {shippingAgency || "DAC"}
                  </span>
                  <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                    {deliveryType}
                  </p>
                </div>
              </div>

              {/* Fila Flete en Destino / Bultos */}
              <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2">
                <div
                  className={`px-3 py-1 rounded-lg border-2 font-black text-xs uppercase tracking-wider ${
                    freightCondition === "destino"
                      ? "border-black bg-black text-white"
                      : "border-slate-800 bg-slate-100 text-slate-900"
                  }`}
                >
                  {freightCondition === "destino" ? "🚚 FLETE A PAGAR EN DESTINO" : "✅ FLETE PAGO"}
                </div>
                <div className="text-right">
                  <span className="font-black text-xs text-black border border-black px-2 py-0.5 rounded">
                    {packageCount}
                  </span>
                </div>
              </div>

              {/* Remitente Box */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-xs">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    REMITENTE:
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">{senderRut}</span>
                </div>
                <p className="font-extrabold text-black text-xs leading-snug">
                  {senderName}
                </p>
                <p className="text-[11px] text-slate-700">
                  Tel: <strong>{senderPhone}</strong> | {senderAddress}
                </p>
              </div>

              {/* Destinatario Box - GRANDE, CLARO Y LEGIBLE PARA TRANSPORTISTA */}
              <div className="p-4 bg-white rounded-xl border-[2.5px] border-black space-y-2.5 shadow-sm">
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-1.5">
                  <span className="text-[11px] font-black uppercase text-pink-600 tracking-wider">
                    DESTINATARIO:
                  </span>
                  <span className="text-xs font-black bg-black text-white px-2.5 py-0.5 rounded uppercase">
                    {recipientDept || "URUGUAY"}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-black leading-tight uppercase">
                    {recipientName || "[NOMBRE O EMPRESA]"}
                  </h3>
                  <p className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-1">
                    <Phone className="w-4 h-4 text-slate-700" />
                    <span>{recipientPhone || "[TELÉFONO DE CONTACTO]"}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-0.5">
                  <p className="text-xs font-black text-black uppercase">
                    📍 {recipientCity ? `${recipientCity}, ` : ""}{recipientDept}
                  </p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {recipientAddress || "[DIRECCIÓN DE ENTREGA O AGENCIA]"}
                  </p>
                </div>

                {rutInfo && (
                  <p className="text-[11px] font-bold text-slate-800 bg-slate-100 p-1.5 rounded mt-1">
                    📝 {rutInfo}
                  </p>
                )}
              </div>

              {/* Contenido Declarado y Advertencia */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600">Contenido:</span>
                  <span className="font-extrabold text-black">{itemsSummary}</span>
                </div>
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="font-black text-red-600 text-xs tracking-wider">
                    {notes}
                  </p>
                </div>
              </div>

              {/* Footer con Código de Barras Simulado y Pedido */}
              <div className="pt-2 border-t-[2px] border-black flex items-center justify-between text-[10px]">
                <div>
                  <span className="font-bold text-slate-500 block">N° de Pedido:</span>
                  <span className="font-mono font-black text-xs text-black">
                    #{orderNumber || "KAM-000000"}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex gap-0.5 h-6 items-center">
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-600 mt-0.5">
                    {orderNumber || "KAMALUSO-UY"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS CSS PARA IMPRESIÓN PRECISA (A6 / TÉRMICA 10x15cm) */}
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
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            height: 145mm !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            border: 3.5px solid #000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 12px !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
