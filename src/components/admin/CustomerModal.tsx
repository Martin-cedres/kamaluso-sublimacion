"use client";

import React, { useEffect, useState } from "react";
import { Customer } from "@/types";
import {
  registerOrUpdateCustomer,
  resolveShippingCompanyAndDelivery,
  resolveShippingMethodNameFromCustomer,
  STANDARD_SHIPPING_METHODS,
  updateCustomerById,
} from "@/lib/customers";
import {
  X,
  User,
  Truck,
  CreditCard,
  CheckCircle2,
  Loader2,
  Edit2,
  UserPlus,
} from "lucide-react";

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSaved: (savedCustomer: Customer) => void;
}

const URUGUAY_DEPARTMENTS = [
  "San José",
  "Montevideo",
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
];

const PAYMENT_METHODS = [
  { id: "brou", name: "Transferencia Bancaria BROU" },
  { id: "efectivo", name: "Pago en Efectivo en Local (San José)" },
  { id: "prex", name: "Transferencia Prex" },
  { id: "oca_blue", name: "Depósito OCA Blue" },
  { id: "mi_dinero", name: "Mi Dinero" },
  { id: "abitab", name: "Giro ABITAB" },
  { id: "red_pagos", name: "Giro RED PAGOS" },
  { id: "mercado_pago_online", name: "Tarjeta de Crédito / Mercado Pago" },
  { id: "otro", name: "Otro / A Convenir" },
];

export default function CustomerModal({
  isOpen,
  onClose,
  customerToEdit,
  onSaved,
}: CustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rutInfo, setRutInfo] = useState("");
  const [department, setDepartment] = useState("San José");
  const [city, setCity] = useState("");
  const [deliveryType, setDeliveryType] = useState<"agencia" | "domicilio" | "local">("agencia");
  const [shippingMethodName, setShippingMethodName] = useState<string>(
    "DAC - Retiro en Agencia"
  );
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("brou");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditing = Boolean(customerToEdit);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);

    if (customerToEdit) {
      const resolvedShip = resolveShippingMethodNameFromCustomer(customerToEdit);
      const { deliveryType: resolvedDelivery } =
        resolveShippingCompanyAndDelivery(resolvedShip);

      setName(customerToEdit.name || "");
      setPhone(customerToEdit.phone || "");
      setEmail(customerToEdit.email || "");
      setRutInfo(customerToEdit.rutInfo || "");
      setDepartment(customerToEdit.department || "San José");
      setCity(customerToEdit.city || "");
      setDeliveryType(customerToEdit.deliveryType || resolvedDelivery);
      setShippingMethodName(resolvedShip);
      setAddress(customerToEdit.address || "");
      setObservations(customerToEdit.observations || "");
      setPaymentMethodId(customerToEdit.paymentMethodId || "brou");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setRutInfo("");
      setDepartment("San José");
      setCity("");
      setDeliveryType("agencia");
      setShippingMethodName("DAC - Retiro en Agencia");
      setAddress("");
      setObservations("");
      setPaymentMethodId("brou");
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  const handleDeliveryTypeChange = (nextType: "agencia" | "domicilio" | "local") => {
    setDeliveryType(nextType);
    if (nextType === "local") {
      setShippingMethodName("Retiro en Local (San José de Mayo)");
      return;
    }

    const lower = shippingMethodName.toLowerCase();
    if (lower.includes("correo")) {
      setShippingMethodName(
        nextType === "domicilio"
          ? "Correo Uruguayo - Envío a Domicilio"
          : "Correo Uruguayo - Retiro en Sucursal"
      );
    } else if (lower.includes("cotmi")) {
      setShippingMethodName(
        nextType === "domicilio"
          ? "COTMI - Envío a Domicilio"
          : "Agencia COTMI - Retiro en Agencia"
      );
    } else {
      setShippingMethodName(
        nextType === "domicilio" ? "DAC - Envío a Domicilio" : "DAC - Retiro en Agencia"
      );
    }
  };

  const handleShippingMethodChange = (nextMethod: string) => {
    setShippingMethodName(nextMethod);
    const { deliveryType: nextDelivery } = resolveShippingCompanyAndDelivery(nextMethod);
    setDeliveryType(nextDelivery);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() && !phone.trim() && !email.trim()) {
      setErrorMsg("Ingresa al menos un nombre, teléfono o email para guardar el cliente.");
      return;
    }

    setIsSaving(true);
    try {
      const { shippingCompany, deliveryType: derivedDelivery } =
        resolveShippingCompanyAndDelivery(shippingMethodName);

      const payload: Partial<Customer> & { explicitEdit?: boolean } = {
        name: name.trim() || "Cliente",
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        rutInfo: rutInfo.trim(),
        department,
        city: city.trim(),
        address: address.trim(),
        observations: observations.trim(),
        deliveryType: deliveryType || derivedDelivery,
        shippingCompany,
        shippingMethodName,
        paymentMethodId,
        explicitEdit: true,
      };

      let saved: Customer | null = null;
      if (customerToEdit?.id && !customerToEdit.id.startsWith("ORD-CUST-")) {
        saved = await updateCustomerById({
          ...payload,
          id: customerToEdit.id,
        });
      } else {
        saved = await registerOrUpdateCustomer({
          ...payload,
          ...(customerToEdit?.id?.startsWith("ORD-CUST-")
            ? {
                totalOrders: customerToEdit.totalOrders,
                totalSpent: customerToEdit.totalSpent,
                lastOrderAt: customerToEdit.lastOrderAt,
              }
            : {}),
        });
      }

      if (!saved) {
        setErrorMsg("No se pudo guardar el cliente. Intenta nuevamente.");
        return;
      }

      onSaved(saved);
      onClose();
    } catch {
      setErrorMsg("Ocurrió un error al guardar el cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Oscuro estilo Kamaluso */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center shrink-0">
              {isEditing ? (
                <Edit2 className="w-4 h-4 text-sky-400" />
              ) : (
                <UserPlus className="w-4 h-4 text-pink-400" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2 truncate">
                <span>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</span>
                <span className="text-[10px] bg-sky-500/25 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/40">
                  {isEditing ? "Ficha Guardada" : "Agenda Kamaluso"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Datos de contacto, envío habitual, RUT/CI y medio de pago preferido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* 1. Identidad y Contacto */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-pink-600" />
                <span>1. Identidad y Contacto</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nombre / Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. María Gómez / Estudio Creativo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 099 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    RUT / CI (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 214567890012 o CI 4.123.456-7"
                    value={rutInfo}
                    onChange={(e) => setRutInfo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Ubicación y Envío Habitual */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>2. Ubicación y Envío Habitual</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Departamento
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {URUGUAY_DEPARTMENTS.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. San José de Mayo / Ciudad de la Costa"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Modalidad
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                    {(
                      [
                        { id: "agencia", label: "Agencia" },
                        { id: "domicilio", label: "Domicilio" },
                        { id: "local", label: "Local" },
                      ] as const
                    ).map((opt) => {
                      const active = deliveryType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleDeliveryTypeChange(opt.id)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                            active
                              ? "bg-sky-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Forma / Empresa de Envío
                  </label>
                  <select
                    value={shippingMethodName}
                    onChange={(e) => handleShippingMethodChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {STANDARD_SHIPPING_METHODS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Dirección o Sucursal de Retiro
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Av. Artigas 450 / Agencia DAC Tres Cruces"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Preferencias y Observaciones */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-pink-600" />
                <span>3. Preferencias y Observaciones</span>
              </h4>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Medio de Pago habitual
                  </label>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Observaciones / Indicaciones
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Avisar por WhatsApp antes de despachar, prefiere envoltorio para regalo..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-pink-600 hover:bg-pink-700 shadow-sm transition disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? "Guardar Cambios" : "Guardar Cliente"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
