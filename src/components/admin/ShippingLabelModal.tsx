"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
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
  observations?: string;
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
  const [senderName, setSenderName] = useState("Katherine Silva");
  const [senderPhone, setSenderPhone] = useState("098 615 074");
  const [senderAddress, setSenderAddress] = useState("San José de Mayo, Uruguay");
  const [senderWebsite, setSenderWebsite] = useState("www.kamaluso.com");
  const [senderRut, setSenderRut] = useState("");

  // Destinatario - 100% Editable
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientDept, setRecipientDept] = useState("Montevideo");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [rutInfo, setRutInfo] = useState("");

  // Logística y Paquete - 100% Editable
  const [shippingAgency, setShippingAgency] = useState("DAC (Agencia Central)");
  const [deliveryType, setDeliveryType] = useState("");
  const [packageCount, setPackageCount] = useState("1 Bulto");
  const [freightCondition, setFreightCondition] = useState<"destino" | "pago">("destino");
  const [orderNumber, setOrderNumber] = useState("");
  const [itemsSummary, setItemsSummary] = useState("Insumos de Papelería Sublimable");
  const [notes, setNotes] = useState("⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE");

  // Estado de copiado
  const [copied, setCopied] = useState(false);

  // Modo de impresión (Color para impresoras láser/tinta o B/N para impresoras térmicas directas)
  const [printColorMode, setPrintColorMode] = useState<"color" | "bw">("color");

  // Código QR Web Real (kamaluso.com)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Visualización limpia de Ciudad y Departamento sin duplicados (evita "Montevideo, Montevideo")
  const cityDeptDisplay = React.useMemo(() => {
    const city = (recipientCity || "").trim();
    const dept = (recipientDept || "").trim();
    if (!city) return dept || "Uruguay";
    if (city.toLowerCase() === dept.toLowerCase()) return dept;
    return `${city}, ${dept}`;
  }, [recipientCity, recipientDept]);

  useEffect(() => {
    QRCode.toDataURL("https://www.kamaluso.com", {
      width: 160,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Error al generar QR:", err));
  }, []);

  // Sincronizar datos automáticamente cada vez que se abre con un pedido o se pasa un initialData
  useEffect(() => {
    if (order) {
      setRecipientName(order.customer.name || "");
      setRecipientPhone(order.customer.phone || "");
      setRecipientDept(order.customer.department || "Montevideo");
      setRecipientCity(order.customer.city || "");
      setRecipientAddress(order.customer.address || "");
      setObservations(order.customer.observations || order.observations || (order as any).notes || "");
      setOrderNumber(order.id || `KAM-${Date.now().toString().slice(-6)}`);

      // Determinar agencia a partir del método de envío del pedido
      const shipName = order.shippingMethodName || "";
      if (shipName.toLowerCase().includes("dac")) {
        setShippingAgency("DAC (Agencia Central)");
        setDeliveryType(shipName.toLowerCase().includes("agencia") || shipName.toLowerCase().includes("sucursal") ? "Retiro en Agencia" : "");
      } else if (shipName.toLowerCase().includes("correo")) {
        setShippingAgency("Correo Uruguayo");
        setDeliveryType(shipName.toLowerCase().includes("domicilio") ? "Envío a Domicilio" : "Retiro en Sucursal");
      } else if (shipName.toLowerCase().includes("cotmi")) {
        setShippingAgency("Agencia COTMI");
        setDeliveryType(shipName.toLowerCase().includes("agencia") || shipName.toLowerCase().includes("sucursal") ? "Retiro en Agencia" : (shipName.toLowerCase().includes("domicilio") ? "Envío a Domicilio" : "Retiro en Agencia"));
      } else if (shipName.toLowerCase().includes("retiro") || shipName.toLowerCase().includes("local")) {
        setShippingAgency("Retiro en Local (San José)");
        setDeliveryType("Retiro Presencial");
      } else {
        setShippingAgency(shipName || "DAC (Agencia Central)");
        setDeliveryType("");
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
      setObservations(initialData.observations || "");
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
      setObservations("");
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
      setObservations(order.customer.observations || order.observations || (order as any).notes || "");
      setOrderNumber(order.id);
    }
  };

  const handleCopyText = () => {
    const text = `*DATOS PARA ENVÍO - KAMALUSO*\n` +
      `📦 *N° Pedido:* ${orderNumber}\n` +
      `🚚 *Agencia:* ${shippingAgency}${deliveryType ? ` (${deliveryType})` : ""}\n\n` +
      `👤 *DESTINATARIO:*\n` +
      `• *Nombre:* ${recipientName}\n` +
      `• *Teléfono:* ${recipientPhone}\n` +
      `• *Ciudad/Depto:* ${recipientCity ? `${recipientCity}, ` : ""}${recipientDept}\n` +
      `• *Dirección / Sucursal:* ${recipientAddress}\n` +
      (observations ? `• *Observaciones:* ${observations}\n` : "") +
      (rutInfo ? `• *RUT/CI:* ${rutInfo}\n` : "") +
      `• *Cuidado:* ${notes}`;

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
                    placeholder="Ej. RUT o C.I."
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
                  className="w-full px-3 py-2 border-2 border-slate-400 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Observaciones de Entrega (Detalles especiales)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregar en la tarde, casa de la esquina, etc."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
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
                    placeholder="DAC / Correo Uruguayo / COTMI"
                    value={shippingAgency}
                    onChange={(e) => setShippingAgency(e.target.value)}
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
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Página Web</label>
                  <input
                    type="text"
                    value={senderWebsite}
                    onChange={(e) => setSenderWebsite(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-pink-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ciudad / Origen</label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3.5 px-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Etiqueta ({printColorMode === "color" ? "Color" : "Térmica B/N"})</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl border border-slate-300 flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
                title="Copiar datos para enviar por WhatsApp al fletero"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copiado" : "Copiar Texto"}</span>
              </button>
            </div>
          </div>

          {/* Printable Label Preview Side */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100/70 p-3 sm:p-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between w-full max-w-[340px] mb-2.5 no-print">
              <span className="text-xs font-bold text-slate-500">Vista previa (10x15cm):</span>
              {/* Selector Color vs Térmica B/N */}
              <div className="inline-flex items-center bg-white p-0.5 rounded-xl border border-slate-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPrintColorMode("color")}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    printColorMode === "color"
                      ? "bg-pink-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Impresión a Color (Tinta, Láser o Papel Adhesivo/Fotográfico)"
                >
                  <span>🎨 Color</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintColorMode("bw")}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    printColorMode === "bw"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Impresión Térmica B/N (Alto contraste para impresoras térmicas de bobina)"
                >
                  <span>⬛ Térmica B/N</span>
                </button>
              </div>
            </div>

            {/* THE PRINTABLE LABEL (Targeted by @media print) */}
            <div
              id="printable-shipping-label"
              className={`printable-label-box bg-white text-slate-900 border-2 sm:border-[2.5px] border-black rounded-xl p-3 sm:p-3.5 shadow-xl font-sans relative flex flex-col justify-between overflow-hidden ${
                printColorMode === "bw" ? "is-bw-mode" : "is-color-mode"
              }`}
              style={{ width: "100%", maxWidth: "340px", height: "510px" }}
            >
              {/* Header Etiqueta con Logo Kamaluso y Agencia */}
              <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-1.5 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 relative flex-shrink-0">
                    <Image
                      src={LOGO_URL}
                      alt="Kamaluso"
                      fill
                      className="object-contain thermal-logo"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-sm sm:text-base tracking-tight leading-none text-black uppercase">
                      KAMALUSO
                    </h2>
                    <p className="text-[8px] sm:text-[8.5px] font-bold text-slate-700 uppercase tracking-wider leading-tight mt-0.5 thermal-text-black">
                      Papelería Sublimable
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 max-w-[155px]">
                  <span className="inline-block bg-black text-white font-black text-[9.5px] sm:text-[10.5px] px-2 py-0.5 rounded uppercase tracking-normal leading-tight thermal-black-badge">
                    {shippingAgency || "DAC"}
                  </span>
                </div>
              </div>

              {/* Remitente Box */}
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-300 text-xs flex-shrink-0 thermal-box">
                <div className="flex justify-between items-center leading-none mb-0.5">
                  <span className="text-[7.5px] font-black uppercase text-slate-600 tracking-wider thermal-text-black">
                    REMITENTE:
                  </span>
                  {senderRut && <span className="text-[7.5px] font-bold text-slate-600 thermal-text-black">{senderRut}</span>}
                </div>
                <p className="font-extrabold text-black text-[11px] leading-tight">
                  {senderName}
                </p>
                <p className="text-[9px] sm:text-[9.5px] text-slate-700 leading-tight mt-0.5 thermal-text-black">
                  Tel: <strong>{senderPhone}</strong> | {senderAddress} {senderWebsite ? `| ${senderWebsite}` : ""}
                </p>
              </div>

              {/* Destinatario Box */}
              <div className="p-2 sm:p-2.5 bg-white rounded-xl border-2 border-black flex-shrink-0 shadow-xs thermal-box space-y-1">
                <div className="flex justify-between items-center border-b border-black pb-1">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-pink-600 thermal-text-black">
                    DESTINATARIO:
                  </span>
                  <span className="text-[11px] font-black bg-black text-white px-2 py-0.5 rounded uppercase thermal-black-badge">
                    {recipientDept || "URUGUAY"}
                  </span>
                </div>

                {/* Nombre de destinatario a ancho completo para que no se quiebre en líneas innecesarias */}
                <h3 className="text-base sm:text-lg font-black text-black leading-tight uppercase break-words">
                  {recipientName || "[NOMBRE O EMPRESA]"}
                </h3>

                {/* Fila con Teléfono y Ubicación limpia */}
                <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-100">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1 thermal-text-black">
                    <Phone className="w-3.5 h-3.5 text-slate-700 thermal-text-black flex-shrink-0" />
                    <span>{recipientPhone || "[TELÉFONO DE CONTACTO]"}</span>
                  </p>
                  <p className="text-[10px] font-black text-black uppercase text-right truncate">
                    📍 {cityDeptDisplay}
                  </p>
                </div>

                {rutInfo && (
                  <p className="text-[8.5px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 thermal-box thermal-text-black">
                    📝 RUT: {rutInfo}
                  </p>
                )}
              </div>

              {/* RECUADRO DIRECCIÓN DE ENTREGA O SUCURSAL */}
              <div className="p-2.5 bg-white rounded-xl border-2 border-black shadow-xs flex-shrink-0 overflow-hidden thermal-box">
                <div className="border-b border-black pb-1 mb-1">
                  <span className="inline-block text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider text-black bg-yellow-300 px-2 py-0.5 rounded border border-black/20">
                    📍 DIRECCIÓN DE ENTREGA / SUCURSAL DE RETIRO
                  </span>
                </div>
                <p className="text-base sm:text-lg font-black text-black uppercase leading-tight tracking-wide break-words py-1">
                  {recipientAddress || "[DIRECCIÓN DE ENTREGA O SUCURSAL DE RETIRO]"}
                </p>
              </div>

              {/* RECUADRO DE OBSERVACIONES */}
              {observations && (
                <div className="p-1.5 bg-slate-50 border border-dashed border-black rounded-lg space-y-0.5 flex-shrink-0 thermal-box">
                  <span className="text-[7.5px] font-black uppercase text-slate-700 tracking-wider block thermal-text-black">
                    💬 OBSERVACIONES / INDICACIONES:
                  </span>
                  <p className="text-[10.5px] font-extrabold text-black leading-tight break-words line-clamp-2">
                    {observations}
                  </p>
                </div>
              )}

              {/* Advertencia de Manipulación y Cuidado - Frágil */}
              <div className="py-1 px-2 bg-red-50 border border-red-500 rounded-lg text-center flex-shrink-0 thermal-box">
                <p className="font-black text-red-700 text-[9.5px] tracking-wide uppercase leading-none thermal-text-black">
                  {notes || "⚠️ CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE"}
                </p>
              </div>

              {/* Footer con N° de Pedido y Código QR para la Web - ANCLADO AL FINAL */}
              <div className="pt-1.5 border-t-2 border-black flex items-center justify-between flex-shrink-0">
                <div>
                  <span className="font-bold text-[8.5px] text-slate-500 uppercase tracking-wider block leading-none thermal-text-black">
                    N° de Pedido:
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-black block leading-tight mt-0.5">
                    #{orderNumber || "KAM-000000"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="text-right">
                    <span className="text-[8px] font-black uppercase text-black block leading-none">
                      Tienda Web
                    </span>
                    <span className="text-[7px] font-semibold text-slate-500 block mt-0.5 leading-none thermal-text-black">
                      Escaneá el QR
                    </span>
                  </div>
                  {qrCodeUrl ? (
                    <div className="w-10 h-10 border-2 border-black p-0.5 rounded bg-white flex items-center justify-center flex-shrink-0 thermal-box">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeUrl}
                        alt="QR Tienda Web Kamaluso"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded border border-slate-300"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS CSS PARA IMPRESIÓN PRECISA EN IMPRESORA TÉRMICA (10x15cm / 100x150mm / 4x6") */}
      <style jsx global>{`
        @page {
          size: 100mm 150mm;
          margin: 0mm !important;
        }
        @media print {
          html,
          body {
            width: 100mm !important;
            height: 150mm !important;
            max-width: 100mm !important;
            max-height: 150mm !important;
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
          .no-print {
            display: none !important;
          }
          #printable-shipping-label,
          #printable-shipping-label * {
            visibility: visible !important;
          }
          #printable-shipping-label {
            position: absolute !important;
            left: 2mm !important;
            top: 2mm !important;
            width: 96mm !important;
            height: 146mm !important;
            max-width: 96mm !important;
            max-height: 146mm !important;
            min-height: 0 !important;
            box-sizing: border-box !important;
            border: 2.5px solid #000000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 3.5mm 4mm !important;
            margin: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            gap: 1.5mm !important;
            z-index: 999999 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-shipping-label > * + * {
            margin-top: 0 !important;
          }
          /* Calibración Térmica Monocromática (solo activa si se selecciona modo Térmica B/N) */
          #printable-shipping-label.is-bw-mode .thermal-box {
            background-color: #ffffff !important;
            border-color: #000000 !important;
          }
          #printable-shipping-label.is-bw-mode .thermal-black-badge {
            background-color: #000000 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-shipping-label.is-bw-mode .thermal-text-black {
            color: #000000 !important;
          }
          #printable-shipping-label.is-bw-mode .thermal-logo {
            filter: grayscale(100%) contrast(140%) !important;
          }
          /* Modo Color (activo por defecto para impresoras de tinta / láser / papel fotográfico o adhesivo) */
          #printable-shipping-label.is-color-mode {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-shipping-label.is-color-mode .thermal-logo {
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}
