"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Home,
  Truck,
  CreditCard,
  Building,
  Sparkles,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Phone,
  FileText,
  Lock,
} from "lucide-react";
import { saveOrder } from "@/lib/orders";
import { lookupCustomerByEmail, registerOrUpdateCustomer } from "@/lib/customers";
import { Customer } from "@/types";

const PAYMENT_METHODS = [
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
  { id: "efectivo", name: "Pago en Efectivo en Local", badge: "Solo retiro en taller" },
];

const URUGUAY_DEPARTMENTS = [
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
];

const LOCAL_STORAGE_KEY = "kamaluso_checkout_customer";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();

  // Contacto & Facturación
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [hasRut, setHasRut] = useState(false);
  const [customerRut, setCustomerRut] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");

  // Modalidad de Entrega: "agencia" | "domicilio" | "local"
  const [deliveryMode, setDeliveryMode] = useState<"agencia" | "domicilio" | "local">("agencia");
  const [shippingAgency, setShippingAgency] = useState<"dac" | "correo" | "cotmi">("dac");
  const [customerDepartment, setCustomerDepartment] = useState("Montevideo");
  const [customerCity, setCustomerCity] = useState("");
  const [agencyBranch, setAgencyBranch] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [homeNotes, setHomeNotes] = useState("");

  // Medio de Pago
  const [paymentMethod, setPaymentMethod] = useState("brou");

  // Estados de proceso y feedback
  const [detectedCustomer, setDetectedCustomer] = useState<Customer | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerDataLoaded, setCustomerDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Cargar datos previos de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setCustomerEmail(parsed.email);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.department) setCustomerDepartment(parsed.department);
        if (parsed.city) setCustomerCity(parsed.city);
        if (parsed.deliveryMode) setDeliveryMode(parsed.deliveryMode);
        if (parsed.shippingAgency) setShippingAgency(parsed.shippingAgency);
        if (parsed.agencyBranch) setAgencyBranch(parsed.agencyBranch);
        if (parsed.homeAddress) setHomeAddress(parsed.homeAddress);
        if (parsed.rut) {
          setHasRut(true);
          setCustomerRut(parsed.rut);
        }
        if (parsed.company) setCustomerCompany(parsed.company);
      }
    } catch {}
  }, []);

  // Guardar datos en localStorage para evitar pérdida por recarga
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          department: customerDepartment,
          city: customerCity,
          deliveryMode,
          shippingAgency,
          agencyBranch,
          homeAddress,
          rut: customerRut,
          company: customerCompany,
        })
      );
    } catch {}
  }, [
    customerEmail,
    customerName,
    customerPhone,
    customerDepartment,
    customerCity,
    deliveryMode,
    shippingAgency,
    agencyBranch,
    homeAddress,
    customerRut,
    customerCompany,
  ]);

  // Autocompletado inteligente por Email desde la base de datos
  useEffect(() => {
    if (!customerEmail.trim()) {
      setDetectedCustomer(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) return;

    const timer = setTimeout(async () => {
      setIsSearchingCustomer(true);
      try {
        const found = await lookupCustomerByEmail(customerEmail.trim());
        if (found && (found.name || found.city || found.address)) {
          setDetectedCustomer(found);
        } else {
          setDetectedCustomer(null);
        }
      } catch {
        setDetectedCustomer(null);
      } finally {
        setIsSearchingCustomer(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [customerEmail]);

  const handleApplyCustomerData = () => {
    if (!detectedCustomer) return;
    if (detectedCustomer.name) setCustomerName(detectedCustomer.name);
    if (detectedCustomer.phone) setCustomerPhone(detectedCustomer.phone);
    if (detectedCustomer.department) setCustomerDepartment(detectedCustomer.department);
    if (detectedCustomer.city) setCustomerCity(detectedCustomer.city);

    if (detectedCustomer.deliveryType === "agencia") {
      setDeliveryMode("agencia");
      if (detectedCustomer.address) setAgencyBranch(detectedCustomer.address);
    } else {
      setDeliveryMode("domicilio");
      if (detectedCustomer.address) setHomeAddress(detectedCustomer.address);
    }

    if (detectedCustomer.shippingCompany === "cotmi") setShippingAgency("cotmi");
    else if (detectedCustomer.shippingCompany === "correo") setShippingAgency("correo");
    else setShippingAgency("dac");

    setCustomerDataLoaded(true);
    setDetectedCustomer(null);
    setTimeout(() => setCustomerDataLoaded(false), 4000);
  };

  // Cálculos de Totales y Recargo Mercado Pago
  const isMp = paymentMethod === "mercado_pago_online";
  const mpSurcharge = isMp ? parseFloat((totalPrice * 0.1).toFixed(2)) : 0;
  const finalTotal = totalPrice + mpSurcharge;

  // Validación sin redundancias
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerEmail.trim()) {
      errors.email = "Ingresa tu correo para recibir el comprobante y confirmación.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        errors.email = "Ingresa un formato de correo válido (ej. tuempresa@gmail.com).";
      }
    }

    if (!customerName.trim()) {
      errors.name = "Ingresa tu Nombre completo o Razón Social.";
    }

    if (!customerPhone.trim()) {
      errors.phone = "Ingresa tu número de Teléfono o WhatsApp.";
    }

    if (deliveryMode !== "local") {
      if (!customerCity.trim()) {
        errors.city = "Ingresa tu Ciudad o Localidad de destino.";
      }

      if (deliveryMode === "agencia" && !agencyBranch.trim()) {
        errors.agencyBranch = "Indica la Sucursal o Terminal donde retirarás (ej. Terminal Tres Cruces).";
      }

      if (deliveryMode === "domicilio" && !homeAddress.trim()) {
        errors.homeAddress = "Ingresa la Calle, Número de puerta y Apto para la entrega.";
      }
    }

    setFieldErrors(errors);

    const keys = Object.keys(errors);
    if (keys.length > 0) {
      setErrorMessage("Por favor revisa los campos marcados en rojo.");
      const firstInput = document.getElementById(`field-${keys[0]}`);
      if (firstInput) {
        firstInput.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInput.focus();
      }
      return false;
    }

    setErrorMessage("");
    setFieldErrors({});
    return true;
  };

  const getShippingAgencyName = () => {
    if (shippingAgency === "dac") return "DAC";
    if (shippingAgency === "correo") return "Correo Uruguayo";
    return "Agencia COTMI";
  };

  const getFullShippingMethodName = () => {
    if (deliveryMode === "local") return "Retiro en Local Kamaluso (San José de Mayo)";
    if (deliveryMode === "agencia") return `${getShippingAgencyName()} - Retiro en Sucursal`;
    return `${getShippingAgencyName()} - Envío a Domicilio`;
  };

  // Procesar compra
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const orderId = `KAM-${Date.now().toString().slice(-6)}`;
    const selectedPayName = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name || paymentMethod;
    const shippingName = getFullShippingMethodName();

    const formattedAddress =
      deliveryMode === "local"
        ? "Retiro en Local Kamaluso (San José de Mayo)"
        : deliveryMode === "agencia"
        ? `Retiro en Sucursal: ${agencyBranch.trim()}`
        : homeAddress.trim();

    const observationsCombined = [
      hasRut && customerRut.trim() ? `RUT: ${customerRut.trim()}` : "",
      customerCompany.trim() ? `Empresa: ${customerCompany.trim()}` : "",
      homeNotes.trim() ? `Notas domicilio: ${homeNotes.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" • ");

    const fullCustomer = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim(),
      department: deliveryMode === "local" ? "San José" : customerDepartment,
      city: deliveryMode === "local" ? "San José de Mayo" : customerCity.trim(),
      address: formattedAddress,
      observations: observationsCombined,
      deliveryType: deliveryMode,
    };

    const orderPayload = {
      id: orderId,
      customer: { ...fullCustomer, deliveryType: deliveryMode },
      items: cart,
      totalPrice,
      finalTotal,
      paymentMethodId: paymentMethod,
      paymentMethodName: selectedPayName,
      shippingMethodName: shippingName,
      status: "pendiente" as const,
      observations: observationsCombined,
      deliveryType: deliveryMode,
    };

    // 1. Guardar Pedido localmente y en Vercel Blob
    try {
      await saveOrder(orderPayload);
    } catch (err) {
      console.warn("Aviso al guardar orden:", err);
    }

    // 2. Registrar o actualizar cliente en base de datos CRM
    try {
      await registerOrUpdateCustomer({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        department: fullCustomer.department,
        city: fullCustomer.city,
        address: deliveryMode === "agencia" ? agencyBranch.trim() : homeAddress.trim(),
        deliveryType: deliveryMode === "local" ? undefined : deliveryMode,
        shippingCompany: deliveryMode === "local" ? undefined : shippingAgency,
        incrementOrder: true,
        orderAmount: finalTotal,
      });
    } catch (err) {
      console.warn("Aviso al registrar cliente:", err);
    }

    // 3. Si es Mercado Pago: crear preferencia con respaldo completo de datos y redirigir
    // El correo de confirmación se enviará automáticamente vía Webhook / Success al acreditarse el pago
    if (isMp) {
      try {
        const mpRes = await fetch("/api/payments/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            items: cart,
            totalPrice,
            finalTotal,
            paymentMethod,
            paymentMethodName: selectedPayName,
            shippingMethod: deliveryMode,
            shippingMethodName: shippingName,
            customer: fullCustomer,
          }),
        });

        const mpData = await mpRes.json();
        if (!mpRes.ok || !mpData.init_point) {
          throw new Error(mpData.message || "Error al conectar con Mercado Pago");
        }

        clearCart();
        window.location.href = mpData.init_point;
        return;
      } catch (mpErr: any) {
        setErrorMessage(
          `Hubo un problema al conectar con Mercado Pago: ${mpErr.message}. Puedes optar por abonar por Transferencia Bancaria.`
        );
        setIsSubmitting(false);
        return;
      }
    }

    // 4. Si es Transferencia u otro medio directo: Enviar correo con instrucciones de pago y redirigir
    try {
      await fetch("/api/send-email", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          cart,
          totalPrice,
          finalTotal,
          paymentMethodId: paymentMethod,
          paymentMethodName: selectedPayName,
          shippingMethodName: shippingName,
          customer: fullCustomer,
        }),
      });
    } catch (err) {
      console.warn("Aviso al enviar email:", err);
    }

    // 5. Redirigir a página de éxito
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}&email=${encodeURIComponent(customerEmail.trim())}`);
  };

  // Carrito vacío
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Tu carrito está vacío</h2>
            <p className="text-xs text-slate-500">
              Agrega insumos, agendas o libretas a tu pedido antes de proceder al checkout.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-600/25 transition active:scale-95"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Header Seguro Kamaluso */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 relative flex-shrink-0">
              <Image
                src="https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3"
                alt="Kamaluso Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block uppercase leading-none">
                KAMALUSO
              </span>
              <span className="text-[10px] text-pink-400 font-bold block leading-tight">
                Papelería Sublimable
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-bold text-[11px]">Checkout Seguro</span>
            </div>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seguir Comprando</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Banner Informativo de Despacho Logístico */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white py-2.5 px-4 text-xs font-extrabold shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
          <Clock className="w-4 h-4 text-pink-200 flex-shrink-0" />
          <span>
            Despacho coordinado en 48h hábiles desde San José de Mayo para pedidos de hasta $2.000 UYU
          </span>
          <span className="hidden md:inline text-pink-200">•</span>
          <span className="text-pink-100 font-medium text-[11px]">
            Para pedidos mayores a $2.000 UYU, consultar tiempo según volumen de taller.
          </span>
        </div>
      </div>

      {/* Contenedor Principal a 2 Columnas */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* COLUMNA IZQUIERDA: FORMULARIO ESPACIOSO (7 de 12 columnas) */}
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* BLOQUE 1: DATOS DE CONTACTO Y FACTURACIÓN */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-pink-600" />
                  <span>1. Contacto & Facturación</span>
                </h3>
                <span className="text-[11px] text-pink-600 font-extrabold bg-pink-50 px-2.5 py-0.5 rounded-full">
                  Confirmación por Email
                </span>
              </div>

              <div className="space-y-3.5">
                {/* Email con autocompletado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico <span className="text-pink-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="field-email"
                      type="email"
                      required
                      placeholder="tuempresa@gmail.com"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none transition ${
                        fieldErrors.email
                          ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                          : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Te enviaremos el comprobante de compra y los datos bancarios a este correo.
                  </p>

                  {/* Estado de búsqueda y tarjeta de autocompletado */}
                  {isSearchingCustomer && (
                    <p className="text-[11px] text-pink-600 font-bold mt-1.5 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Buscando datos de cliente registrado...</span>
                    </p>
                  )}

                  {customerDataLoaded && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 mt-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>¡Datos del cliente cargados con éxito!</span>
                    </div>
                  )}

                  {detectedCustomer && !customerDataLoaded && (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs space-y-2 mt-2 shadow-sm animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-900 flex items-center gap-1 text-xs">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>¡Hola {detectedCustomer.name}!</span>
                        </span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-black px-2 py-0.5 rounded-full uppercase">
                          Cliente Registrado
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        Encontramos tus datos habituales ({detectedCustomer.phone || "Teléfono"} •{" "}
                        {detectedCustomer.city || "Uruguay"}). ¿Deseas autocompletar tu pedido?
                      </p>
                      <button
                        type="button"
                        onClick={handleApplyCustomerData}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
                      >
                        <span>Cargar mis datos guardados</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Completo o Empresa <span className="text-pink-600">*</span>
                    </label>
                    <input
                      id="field-name"
                      type="text"
                      required
                      placeholder="Ej. María García / Imprenta San José"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none transition ${
                        fieldErrors.name
                          ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                          : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono o Celular (WhatsApp) <span className="text-pink-600">*</span>
                    </label>
                    <input
                      id="field-phone"
                      type="tel"
                      required
                      placeholder="Ej. 099 123 456"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none transition ${
                        fieldErrors.phone
                          ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                          : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkbox RUT Opcional */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasRut}
                      onChange={(e) => setHasRut(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-700">¿Deseas factura con RUT?</span>
                  </label>

                  {hasRut && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Número de RUT</label>
                        <input
                          type="text"
                          placeholder="Ej. 211234560012"
                          value={customerRut}
                          onChange={(e) => setCustomerRut(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Razón Social</label>
                        <input
                          type="text"
                          placeholder="Ej. Imprenta García SRL"
                          value={customerCompany}
                          onChange={(e) => setCustomerCompany(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BLOQUE 2: FORMA Y DESTINO DE ENTREGA (SIN REDUNDANCIAS) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>2. Forma de Entrega</span>
                </h3>
                <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Todo Uruguay
                </span>
              </div>

              {/* Selector de 3 modalidades en pestañas visuales claras */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMode("agencia");
                    setFieldErrors({});
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                    deliveryMode === "agencia"
                      ? "bg-white text-pink-600 shadow-md border-2 border-pink-500 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Retiro en Sucursal</span>
                  <span className="text-[10px] font-normal text-slate-500">DAC / Correo / COTMI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMode("domicilio");
                    setFieldErrors({});
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                    deliveryMode === "domicilio"
                      ? "bg-white text-pink-600 shadow-md border-2 border-pink-500 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Envío a Domicilio</span>
                  <span className="text-[10px] font-normal text-slate-500">A tu casa o taller</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMode("local");
                    setFieldErrors({});
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                    deliveryMode === "local"
                      ? "bg-white text-emerald-700 shadow-md border-2 border-emerald-500 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Retiro en Taller</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Sin costo • San José</span>
                </button>
              </div>

              {/* CAMPOS ESPECÍFICOS SEGÚN MODALIDAD */}
              {deliveryMode === "local" ? (
                /* RETIRO EN TALLER KAMALUSO (Cero campos de dirección) */
                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-emerald-800 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Retiro en Local Kamaluso (San José de Mayo)</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Ubicación en San José de Mayo, Uruguay. Costo de flete: <strong>$0 UYU (Gratis)</strong>. Te
                    avisaremos por WhatsApp o correo en cuanto tu paquete esté armado y listo para retirar.
                  </p>
                </div>
              ) : (
                /* ENVÍO POR AGENCIA O DOMICILIO */
                <div className="space-y-4 pt-1 animate-in fade-in">
                  {/* Empresa de encomienda */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Empresa de Encomienda <span className="text-pink-600">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "dac", name: "DAC", sub: "Agencia Central" },
                        { id: "correo", name: "Correo Uruguayo", sub: "Red Nacional" },
                        { id: "cotmi", name: "COTMI", sub: "Línea Ruta 1 / San José" },
                      ].map((ag) => (
                        <button
                          key={ag.id}
                          type="button"
                          onClick={() => setShippingAgency(ag.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            shippingAgency === ag.id
                              ? "border-pink-600 bg-pink-50/60 text-slate-900 font-extrabold"
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-600 font-medium"
                          }`}
                        >
                          <span className="block text-xs font-black">{ag.name}</span>
                          <span className="block text-[10px] text-slate-500">{ag.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Departamento y Ciudad */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Departamento de Destino <span className="text-pink-600">*</span>
                      </label>
                      <select
                        value={customerDepartment}
                        onChange={(e) => setCustomerDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      >
                        {URUGUAY_DEPARTMENTS.map((dep) => (
                          <option key={dep} value={dep}>
                            {dep}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ciudad o Localidad <span className="text-pink-600">*</span>
                      </label>
                      <input
                        id="field-city"
                        type="text"
                        placeholder="Ej. Las Piedras, Maldonado, Salto..."
                        value={customerCity}
                        onChange={(e) => {
                          setCustomerCity(e.target.value);
                          if (fieldErrors.city) setFieldErrors((p) => ({ ...p, city: "" }));
                        }}
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none transition ${
                          fieldErrors.city
                            ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                            : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                        }`}
                      />
                      {fieldErrors.city && (
                        <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{fieldErrors.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CASO A: RETIRO EN SUCURSAL (SOLO PIDE LA AGENCIA, NO DIRECCIÓN DE CASA) */}
                  {deliveryMode === "agencia" ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <label className="block text-xs font-extrabold text-slate-800">
                        Sucursal o Terminal de Retiro de {shippingAgency.toUpperCase()}{" "}
                        <span className="text-pink-600">*</span>
                      </label>
                      <input
                        id="field-agencyBranch"
                        type="text"
                        placeholder="Ej. Terminal Tres Cruces, Sucursal Pando, Agencia Central Salto..."
                        value={agencyBranch}
                        onChange={(e) => {
                          setAgencyBranch(e.target.value);
                          if (fieldErrors.agencyBranch) setFieldErrors((p) => ({ ...p, agencyBranch: "" }));
                        }}
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 focus:outline-none transition ${
                          fieldErrors.agencyBranch
                            ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                            : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                        }`}
                      />
                      {fieldErrors.agencyBranch && (
                        <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{fieldErrors.agencyBranch}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        📌 Despacharemos a esta sucursal. Retirarás con tu Cédula de Identidad o Nombre. Flete a pagar
                        en destino a la agencia.
                      </p>
                    </div>
                  ) : (
                    /* CASO B: ENVÍO A DOMICILIO (PIDE CALLE Y NÚMERO) */
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 mb-1">
                          Dirección de Domicilio (Calle, N° de puerta y Apto) <span className="text-pink-600">*</span>
                        </label>
                        <input
                          id="field-homeAddress"
                          type="text"
                          placeholder="Ej. Av. 18 de Julio 1234 Apto 201"
                          value={homeAddress}
                          onChange={(e) => {
                            setHomeAddress(e.target.value);
                            if (fieldErrors.homeAddress) setFieldErrors((p) => ({ ...p, homeAddress: "" }));
                          }}
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 focus:outline-none transition ${
                            fieldErrors.homeAddress
                              ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                              : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                          }`}
                        />
                        {fieldErrors.homeAddress && (
                          <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{fieldErrors.homeAddress}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Indicaciones para identificar la vivienda (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Casa de rejas negras, portón de madera, entre calles X e Y..."
                          value={homeNotes}
                          onChange={(e) => setHomeNotes(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BLOQUE 3: MEDIO DE PAGO */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  <span>3. Medio de Pago</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Elige tu forma de pago</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.filter((m) => (deliveryMode === "local" ? true : m.id !== "efectivo")).map(
                  (method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-2 transition ${
                          isSelected
                            ? "border-pink-600 bg-pink-50/50 ring-2 ring-pink-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-xs text-slate-900 leading-snug">{method.name}</p>
                          <span
                            className={`inline-block text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                              method.badge.includes("10%")
                                ? "bg-sky-100 text-sky-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {method.badge}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected ? "border-pink-600 bg-pink-600" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {isMp ? (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Pago Online con Tarjeta (Mercado Pago)</span>
                  </p>
                  <p className="text-[11px] text-sky-700 leading-relaxed">
                    Al confirmar, serás redirigido a la pasarela segura de Mercado Pago para abonar con tarjeta de
                    crédito o débito. Aplica un 10% de recargo por comisión financiera (${mpSurcharge.toLocaleString("es-UY")} UYU).
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sin comisiones bancarias</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Recibirás las cuentas bancarias (BROU, Prex, OCA Blue, Abitab) en pantalla y por correo electrónico
                    al confirmar tu pedido.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN STICKY DEL PEDIDO (5 de 12 columnas) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-pink-600" />
                  <span>Resumen del Pedido</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">{cart.length} productos</span>
              </div>

              {/* Lista de productos con miniaturas */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 py-1">
                    <div className="relative w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.product.images && item.product.images[0]
                            ? item.product.images[0]
                            : "/agenda_fondo_kamaluso.jpg"
                        }
                        alt={item.product.name}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} u. × ${item.product.price} UYU
                      </p>
                    </div>
                    <div className="text-right font-black text-xs text-slate-900">
                      ${(item.product.price * item.quantity).toLocaleString("es-UY")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desglose de Precios */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal Insumos:</span>
                  <span className="font-bold text-slate-800">${totalPrice.toLocaleString("es-UY")} UYU</span>
                </div>

                {isMp && (
                  <div className="flex justify-between text-sky-700 font-medium">
                    <span>Recargo Mercado Pago (10%):</span>
                    <span className="font-bold">+${mpSurcharge.toLocaleString("es-UY")} UYU</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Flete / Envío:</span>
                  <span className="font-bold text-slate-800">
                    {deliveryMode === "local" ? "Retiro Gratis en Local" : "A pagar en destino"}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900 uppercase">Total a Pagar:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-pink-600 leading-none">
                      ${finalTotal.toLocaleString("es-UY")}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1">UYU</span>
                  </div>
                </div>
              </div>

              {/* Botón Principal de Envío */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50 ${
                    isMp
                      ? "bg-sky-600 hover:bg-sky-700 shadow-sky-600/25"
                      : "bg-pink-600 hover:bg-pink-700 shadow-pink-600/25"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando Pedido...</span>
                    </>
                  ) : isMp ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pagar con Tarjeta (Mercado Pago)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirmar y Finalizar Pedido</span>
                    </>
                  )}
                </button>
              </div>

              {/* Garantías y Confianza */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Fabricantes directos de insumos en San José de Mayo.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>Despacho en 48h hábiles (pedidos hasta $2.000 UYU).</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>Envíos a Montevideo y los 19 departamentos.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
