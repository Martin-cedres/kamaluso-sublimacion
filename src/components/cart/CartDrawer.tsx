"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";
import {
  ShoppingBag,
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Send,
  Loader2,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Home,
  Building2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { saveOrder } from "@/lib/orders";
import { getPaymentInstructions } from "@/lib/whatsapp";
import { Customer } from "@/types";
import { lookupCustomerByEmail, registerOrUpdateCustomer } from "@/lib/customers";

const PAYMENT_METHODS = [
  { id: "brou", name: "Transferencia Bancaria BROU" },
  { id: "prex", name: "Transferencia Prex" },
  { id: "oca_blue", name: "Depósito OCA Blue" },
  { id: "mi_dinero", name: "Mi Dinero" },
  { id: "abitab", name: "Giro ABITAB" },
  { id: "red_pagos", name: "Giro RED PAGOS" },
  { id: "efectivo", name: "Pago en Efectivo en Local (San José)" },
  {
    id: "mercado_pago_online",
    name: "Tarjeta de Crédito / Débito (Mercado Pago) (+10% recargo)",
  },
];

const SHIPPING_COMPANIES = [
  { id: "dac", name: "DAC (Agencia Central)" },
  { id: "correo", name: "Correo Uruguayo" },
  { id: "cotmi", name: "Agencia COTMI" },
  { id: "pickup", name: "Retiro en Local (San José de Mayo)" },
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

interface FieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
}

interface OrderSuccessState {
  orderId: string;
  waUrl: string;
  total: number;
  paymentName: string;
  isPickup: boolean;
}

const LOCAL_CUSTOMER_STORAGE_KEY = "kamaluso_checkout_customer";

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Datos del Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDepartment, setCustomerDepartment] = useState("Montevideo");
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerObservations, setCustomerObservations] = useState("");

  // Opciones comerciales
  const [paymentMethod, setPaymentMethod] = useState("brou");
  const [deliveryType, setDeliveryType] = useState<"domicilio" | "agencia">("domicilio");
  const [shippingCompany, setShippingCompany] = useState("dac");

  // Estados de proceso y validación
  const [isLoadingMp, setIsLoadingMp] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [mpError, setMpError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessState | null>(null);
  const [detectedCustomer, setDetectedCustomer] = useState<Customer | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerDataLoaded, setCustomerDataLoaded] = useState(false);

  // Detección inteligente de cliente registrado por email al escribir
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
    if (detectedCustomer.address) setCustomerAddress(detectedCustomer.address);
    if (detectedCustomer.deliveryType) setDeliveryType(detectedCustomer.deliveryType);
    if (detectedCustomer.shippingCompany) setShippingCompany(detectedCustomer.shippingCompany);
    setCustomerDataLoaded(true);
    setDetectedCustomer(null);
    setTimeout(() => setCustomerDataLoaded(false), 4000);
  };

  // Cargar datos previos del comprador desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CUSTOMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.email) setCustomerEmail(parsed.email);
        if (parsed.department) setCustomerDepartment(parsed.department);
        if (parsed.city) setCustomerCity(parsed.city);
        if (parsed.address) setCustomerAddress(parsed.address);
        if (parsed.deliveryType) setDeliveryType(parsed.deliveryType);
        if (parsed.shippingCompany) setShippingCompany(parsed.shippingCompany);
      }
    } catch {
      // Ignorar errores de localStorage restringido
    }
  }, []);

  // Guardar datos del comprador cada vez que cambien para evitar pérdida de progreso
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_CUSTOMER_STORAGE_KEY,
        JSON.stringify({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          department: customerDepartment,
          city: customerCity,
          address: customerAddress,
          deliveryType,
          shippingCompany,
        })
      );
    } catch {
      // Ignorar errores en navegadores con cuota llena
    }
  }, [
    customerName,
    customerPhone,
    customerEmail,
    customerDepartment,
    customerCity,
    customerAddress,
    deliveryType,
    shippingCompany,
  ]);

  if (!isCartOpen) return null;

  const isPickup = shippingCompany === "pickup";

  const getShippingMethodName = () => {
    if (isPickup) return "Retiro en Local (San José de Mayo)";
    if (shippingCompany === "correo") {
      return deliveryType === "domicilio"
        ? "Correo Uruguayo - Envío a Domicilio"
        : "Correo Uruguayo - Retiro en Sucursal";
    }
    if (shippingCompany === "cotmi") {
      return deliveryType === "domicilio"
        ? "COTMI - Envío a Domicilio"
        : "Agencia COTMI - Retiro en Agencia";
    }
    return deliveryType === "domicilio"
      ? "DAC - Envío a Domicilio"
      : "DAC - Retiro en Agencia";
  };

  const getShippingMethodId = () => {
    if (isPickup) return "pickup";
    return `${shippingCompany}_${deliveryType}`;
  };

  const getShippingCompanyName = () => {
    if (shippingCompany === "dac") return "DAC";
    if (shippingCompany === "correo") return "Correo Uruguayo";
    if (shippingCompany === "cotmi") return "Agencia COTMI";
    return "Local San José";
  };

  // Recargo de Mercado Pago (+10%)
  const isMp = paymentMethod === "mercado_pago_online";
  const mpSurcharge = isMp ? parseFloat((totalPrice * 0.1).toFixed(2)) : 0;
  const finalTotal = totalPrice + mpSurcharge;

  // Validar datos antes de procesar el pedido con feedback por campo
  const validateCustomerData = (): boolean => {
    const errors: FieldErrors = {};

    if (!customerName.trim()) {
      errors.name = "Por favor ingresa tu Nombre Completo o Empresa.";
    }

    if (!customerPhone.trim()) {
      errors.phone = "Por favor ingresa tu Teléfono o WhatsApp de contacto.";
    }

    // Correo electrónico es OPCIONAL para no trabar compras rápidas por WhatsApp
    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        errors.email = "Ingresa un correo electrónico válido (ej. tuempresa@gmail.com).";
      }
    }

    // Validación de destino si no es retiro en local
    if (!isPickup) {
      if (!customerCity.trim()) {
        errors.city = "Por favor ingresa tu Ciudad o Localidad de entrega.";
      }

      if (deliveryType === "domicilio" && !customerAddress.trim()) {
        errors.address = "Por favor ingresa la Calle y Número para el envío a domicilio.";
      }
    }

    setFieldErrors(errors);

    const errorKeys = Object.keys(errors) as (keyof FieldErrors)[];
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      setValidationError(errors[firstKey] || "Por favor completa los campos requeridos marcados en rojo.");

      setTimeout(() => {
        const inputElem = document.getElementById(`field-${firstKey}`);
        if (inputElem) {
          inputElem.scrollIntoView({ behavior: "smooth", block: "center" });
          inputElem.focus();
        } else {
          const drawerBody = document.getElementById("cart-drawer-body");
          if (drawerBody) drawerBody.scrollTop = 0;
        }
      }, 50);

      return false;
    }

    setValidationError("");
    setFieldErrors({});
    return true;
  };

  // Construir mensaje estructurado, registrar venta, notificar y abrir WhatsApp sin bloqueos
  const handleWhatsAppAndEmailSubmit = () => {
    if (!validateCustomerData()) return;

    setIsSendingOrder(true);
    setMpError("");

    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name;
    const selectedShip = getShippingMethodName();
    const orderIdToUse = activeOrderId || `KAM-${Date.now().toString().slice(-6)}`;
    setActiveOrderId(orderIdToUse);

    const fullOrderPayload = {
      id: orderIdToUse,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        department: isPickup ? "San José" : customerDepartment,
        city: isPickup ? "San José de Mayo" : customerCity.trim(),
        address: isPickup
          ? "Retiro en Local (San José)"
          : deliveryType === "domicilio"
          ? customerAddress.trim()
          : (customerAddress.trim() || `Retiro en Agencia ${getShippingCompanyName()} de ${customerCity.trim()}`),
        observations: customerObservations.trim(),
      },
      items: cart,
      totalPrice,
      finalTotal,
      paymentMethodId: paymentMethod,
      paymentMethodName: selectedPay || paymentMethod,
      shippingMethodName: selectedShip,
      status: "pendiente" as const,
      observations: customerObservations.trim(),
    };

    // 1. Guardar de forma local e inmediata
    try {
      saveOrder(fullOrderPayload);
    } catch (orderErr) {
      console.warn("Aviso al guardar pedido:", orderErr);
    }

    // 2. Disparar notificación por Email en segundo plano con keepalive sin bloquear la redirección
    try {
      fetch("/api/send-email", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToUse,
          cart,
          totalPrice,
          finalTotal,
          paymentMethodId: paymentMethod,
          paymentMethodName: selectedPay,
          shippingMethodName: selectedShip,
          customer: fullOrderPayload.customer,
        }),
      }).catch((err) => console.warn("Aviso al enviar email en background:", err));
    } catch (err) {
      console.warn("Aviso al despachar email:", err);
    }

    // Registrar o actualizar datos del cliente en la base de datos
    registerOrUpdateCustomer({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim(),
      department: isPickup ? "San José" : customerDepartment,
      city: isPickup ? "San José de Mayo" : customerCity.trim(),
      address: isPickup
        ? "Retiro en Local (San José)"
        : deliveryType === "domicilio"
        ? customerAddress.trim()
        : (customerAddress.trim() || `Retiro en Agencia ${getShippingCompanyName()} (${customerCity.trim()})`),
      deliveryType,
      shippingCompany,
      incrementOrder: true,
      orderAmount: finalTotal,
    });

    // 3. Construir mensaje estructurado para WhatsApp
    let message = `*NUEVO PEDIDO MAYORISTA #${orderIdToUse} - KAMALUSO SUBLIMACIÓN*\n\n`;

    message += `👤 *DATOS DEL COMPRADOR:*\n`;
    message += `• *Nombre/Empresa:* ${customerName.trim()}\n`;
    message += `• *Teléfono:* ${customerPhone.trim()}\n`;
    if (customerEmail.trim()) {
      message += `• *Email:* ${customerEmail.trim()}\n`;
    }
    if (isPickup) {
      message += `• *Modalidad:* Retiro en Local Kamaluso (San José de Mayo)\n`;
    } else {
      message += `• *Ubicación:* ${customerCity.trim()}, ${customerDepartment}\n`;
      message += `• *Forma de Envío:* ${selectedShip}\n`;
      message += `• *Dirección/Destino:* ${
        deliveryType === "domicilio"
          ? customerAddress.trim()
          : (customerAddress.trim() || `Retiro en Agencia ${getShippingCompanyName()} (${customerCity.trim()})`)
      }\n`;
    }
    if (customerObservations.trim()) {
      message += `• *Observaciones:* ${customerObservations.trim()}\n`;
    }
    message += `\n`;

    message += `📦 *PRODUCTOS SOLICITADOS:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (x${item.quantity}) - $${(
        item.product.price * item.quantity
      ).toLocaleString("es-UY")} UYU\n`;
    });

    message += `\n💰 *SUBTOTAL PRODUCTOS:* $${totalPrice.toLocaleString("es-UY")} UYU\n`;

    if (isMp) {
      message += `💳 *RECARGO MERCADO PAGO TARJETA (10%):* $${mpSurcharge.toLocaleString("es-UY")} UYU\n`;
      message += `💵 *TOTAL CON TARJETA:* $${finalTotal.toLocaleString("es-UY")} UYU\n`;
      message += `💡 _(Nota: Si abonas por Transferencia BROU / Prex / Abitab, el total a pagar es $${totalPrice.toLocaleString("es-UY")} UYU sin el 10% de recargo)._\n`;
    } else {
      message += `💵 *TOTAL A PAGAR:* $${finalTotal.toLocaleString("es-UY")} UYU\n`;
    }

    message += `\n💳 *MÉTODO DE PAGO ELEGIDO:* ${selectedPay}\n`;
    message += `🚚 *FORMA DE ENVÍO:* ${selectedShip}\n\n`;

    // 4. Instrucciones dinámicas de pago según medio seleccionado
    message += `${getPaymentInstructions(paymentMethod, orderIdToUse)}\n\n`;
    message += `📦 _Despacho coordinado a todo el país. ¡Muchas gracias por tu compra en Kamaluso!_`;

    const waUrl = `https://wa.me/59898615074?text=${encodeURIComponent(message)}`;

    // 5. Configurar estado de confirmación en la UI
    setOrderSuccess({
      orderId: orderIdToUse,
      waUrl,
      total: finalTotal,
      paymentName: selectedPay || paymentMethod,
      isPickup,
    });
    setIsSendingOrder(false);

    // 6. Abrir WhatsApp de inmediato mientras dura el clic del usuario (evita bloqueo de popups)
    try {
      const opened = window.open(waUrl, "_blank");
      if (!opened || opened.closed || typeof opened.closed === "undefined") {
        // Fallback para móviles que bloquean window.open asíncrono
        window.location.href = waUrl;
      }
    } catch {
      window.location.href = waUrl;
    }
  };

  // Manejar Pago Directo con Mercado Pago de forma ultra-rápida y resiliente
  const handleMercadoPagoCheckout = async () => {
    if (!validateCustomerData()) return;
    if (cart.length === 0) return;

    setIsLoadingMp(true);
    setMpError("");

    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name;
    const selectedShip = getShippingMethodName();
    const selectedShipId = getShippingMethodId();
    const orderIdToUse = activeOrderId || `KAM-${Date.now().toString().slice(-6)}`;
    setActiveOrderId(orderIdToUse);

    const fullOrderPayload = {
      id: orderIdToUse,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        department: isPickup ? "San José" : customerDepartment,
        city: isPickup ? "San José de Mayo" : customerCity.trim(),
        address: isPickup ? "Retiro en Local (San José)" : customerAddress.trim(),
        observations: customerObservations.trim(),
      },
      items: cart,
      totalPrice,
      finalTotal,
      paymentMethodId: paymentMethod,
      paymentMethodName: selectedPay || paymentMethod,
      shippingMethodName: selectedShip,
      status: "pendiente" as const,
      observations: customerObservations.trim(),
    };

    // 1. Guardar pedido en background sin bloquear
    try {
      saveOrder(fullOrderPayload);
    } catch (orderErr) {
      console.warn("Aviso al guardar pedido:", orderErr);
    }

    // Registrar o actualizar cliente en la base de datos
    registerOrUpdateCustomer({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim(),
      department: isPickup ? "San José" : customerDepartment,
      city: isPickup ? "San José de Mayo" : customerCity.trim(),
      address: isPickup ? "Retiro en Local (San José)" : customerAddress.trim(),
      deliveryType,
      shippingCompany,
      incrementOrder: true,
      orderAmount: finalTotal,
    });

    // 2. Disparar email informativo en background
    try {
      fetch("/api/send-email", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToUse,
          cart,
          totalPrice,
          finalTotal,
          paymentMethodId: paymentMethod,
          paymentMethodName: selectedPay,
          shippingMethodName: selectedShip,
          customer: fullOrderPayload.customer,
        }),
      }).catch((err) => console.warn("Aviso al enviar email antes de MP:", err));
    } catch (err) {
      console.warn("Aviso al despachar email de MP:", err);
    }

    // 3. Conectar directamente con Mercado Pago
    try {
      const response = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToUse,
          items: cart,
          paymentMethod,
          shippingMethod: selectedShipId,
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim() || "cliente@kamaluso.com",
            phone: customerPhone.trim(),
            address: isPickup
              ? "Retiro en Local (San José)"
              : `${customerAddress.trim()}, ${customerCity.trim()}, ${customerDepartment}`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al conectar con la pasarela de Mercado Pago");
      }

      if (data.init_point) {
        clearCart();
        setActiveOrderId(null);
        window.location.href = data.init_point;
      } else {
        throw new Error("No se recibió la URL de pago de Mercado Pago");
      }
    } catch (err: any) {
      setMpError(err.message || "Error al conectar con Mercado Pago. Puedes culminar tu compra por WhatsApp.");
      setIsLoadingMp(false);
    }
  };

  const handleFinishAndReset = () => {
    clearCart();
    setOrderSuccess(null);
    setActiveOrderId(null);
    setIsCartOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!orderSuccess) setIsCartOpen(false);
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-600 rounded-xl text-white shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                  <span>Tu Carrito</span>
                  {orderSuccess ? (
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      ¡Pedido Listo!
                    </span>
                  ) : (
                    <span className="text-[10px] bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/40">
                      Paso {step} de 2
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">Kamaluso • San José de Mayo, Uruguay</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          {!orderSuccess && cart.length > 0 && (
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  step === 1
                    ? "border-pink-600 text-pink-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>1. Productos ({cart.length})</span>
              </button>

              <button
                onClick={() => {
                  if (cart.length > 0) setStep(2);
                }}
                className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  step === 2
                    ? "border-pink-600 text-pink-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="w-4 h-4" />
                <span>2. Envío & Pago</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div id="cart-drawer-body" className="flex-1 overflow-y-auto p-4 space-y-4">
            {orderSuccess ? (
              /* PANTALLA DE ÉXITO Y REDIRECCIÓN RESILIENTE A WHATSAPP */
              <div className="py-6 px-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/10 border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Pedido #{orderSuccess.orderId}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    ¡Pedido Registrado con Éxito!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Hemos guardado tu pedido en el sistema. Abrimos WhatsApp con el detalle de tus insumos para confirmar el pago y coordinar el despacho.
                  </p>
                </div>

                {/* Resumen Compacto */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-bold">Total a abonar:</span>
                    <span className="text-base font-black text-pink-600">
                      ${orderSuccess.total.toLocaleString("es-UY")} UYU
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Medio seleccionado:</span>
                    <span className="font-bold text-slate-800">{orderSuccess.paymentName}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Entrega:</span>
                    <span className="font-bold text-slate-800">
                      {orderSuccess.isPickup ? "Retiro en Local Kamaluso" : "Envío por Agencia"}
                    </span>
                  </div>
                </div>

                {/* Botón Principal para Reabrir WhatsApp en caso de bloqueo de popups */}
                <div className="space-y-2 pt-2">
                  <a
                    href={orderSuccess.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-sm uppercase tracking-wider"
                  >
                    <Send className="w-5 h-5" />
                    <span>Continuar en WhatsApp Ahora</span>
                  </a>

                  <p className="text-[11px] text-slate-400">
                    ¿No se abrió WhatsApp automáticamente? Haz clic en el botón verde de arriba.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleFinishAndReset}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                  >
                    Listo, cerrar y vaciar carrito
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              /* CARRITO VACÍO */
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Tu carrito está vacío</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explora nuestro catálogo de interiores de agendas, libretas y cuadernos sublimables.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 text-xs text-white font-extrabold bg-pink-600 rounded-xl hover:bg-pink-700 shadow-md shadow-pink-600/20 transition-transform active:scale-95"
                >
                  Ver Catálogo de Insumos
                </button>
              </div>
            ) : step === 1 ? (
              /* PASO 1: LISTADO DE PRODUCTOS */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Productos en tu carrito ({cart.length})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 hover:underline"
                    title="Vaciar todo el carrito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar carrito</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 border border-slate-200/80 rounded-2xl bg-white shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                        <Image
                          src={
                            item.product.images && item.product.images.length > 0 && item.product.images[0]
                              ? item.product.images[0]
                              : "/agenda_fondo_kamaluso.jpg"
                          }
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-l-lg font-black transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                updateQuantity(item.product.id, val);
                              }}
                              className="w-10 text-center text-xs font-bold bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-r-lg font-black transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-sm text-slate-900">
                              ${(item.product.price * item.quantity).toLocaleString("es-UY")}{" "}
                              <span className="text-[10px] font-normal text-slate-500">UYU</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-xl text-xs text-pink-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>Sin mínimo de compra. Despacho coordinado a todo el país desde San José.</span>
                </div>
              </div>
            ) : (
              /* PASO 2: DATOS DEL CLIENTE, ENVÍO Y PAGO */
              <div className="space-y-4">
                {/* Alerta de Error de Validación Superior */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-start gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{validationError}</p>
                    </div>
                  </div>
                )}

                {/* Alerta de Error de Mercado Pago */}
                {mpError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{mpError}</p>
                      <button
                        type="button"
                        onClick={handleWhatsAppAndEmailSubmit}
                        className="mt-1 text-emerald-800 underline font-extrabold block hover:text-emerald-950"
                      >
                        Culminar pedido por WhatsApp ahora →
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. SECCIÓN: DATOS DEL COMPRADOR */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-pink-600" />
                    <span>1. Datos del Comprador / Taller</span>
                  </h4>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nombre completo o Empresa <span className="text-pink-600">*</span>
                      </label>
                      <input
                        id="field-name"
                        type="text"
                        placeholder="Ej. María García / Imprenta San José"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className={`w-full px-3 py-2 border rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none transition ${
                          fieldErrors.name
                            ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                            : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Teléfono o Celular (WhatsApp) <span className="text-pink-600">*</span>
                        </label>
                        <input
                          id="field-phone"
                          type="tel"
                          placeholder="Ej. 099 123 456"
                          value={customerPhone}
                          onChange={(e) => {
                            setCustomerPhone(e.target.value);
                            if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                          }}
                          className={`w-full px-3 py-2 border rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none transition ${
                            fieldErrors.phone
                              ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                              : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                          }`}
                        />
                        {fieldErrors.phone && (
                          <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{fieldErrors.phone}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Correo Electrónico <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <input
                          id="field-email"
                          type="email"
                          placeholder="tuempresa@gmail.com"
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }}
                          className={`w-full px-3 py-2 border rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none transition ${
                            fieldErrors.email
                              ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                              : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{fieldErrors.email}</span>
                          </p>
                        )}

                        {isSearchingCustomer && (
                          <p className="text-[10px] text-pink-600 font-bold mt-1 flex items-center gap-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Buscando datos de cliente registrado...</span>
                          </p>
                        )}

                        {customerDataLoaded && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>¡Datos del cliente cargados con éxito!</span>
                          </div>
                        )}

                        {detectedCustomer && !customerDataLoaded && (
                          <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-xl text-xs space-y-2 mt-2 shadow-sm animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-emerald-900 flex items-center gap-1 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 animate-pulse" />
                                <span>¡Hola {detectedCustomer.name}!</span>
                              </span>
                              <span className="text-[9px] bg-emerald-200/80 text-emerald-900 font-black px-1.5 py-0.5 rounded-full uppercase">
                                Cliente Registrado
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-tight">
                              Encontramos tus datos habituales: <strong>{detectedCustomer.phone || "Teléfono registrado"}</strong> • {detectedCustomer.city}, {detectedCustomer.department}.
                            </p>
                            <button
                              type="button"
                              onClick={handleApplyCustomerData}
                              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-lg text-[11px] shadow-sm flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>Cargar mis datos guardados</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN: FORMA Y DESTINO DE ENTREGA */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>2. Forma y Destino de Entrega</span>
                  </h4>

                  {/* Selección de Empresa / Modalidad */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ¿Cómo deseas recibir tus insumos? <span className="text-pink-600">*</span>
                    </label>
                    <select
                      value={shippingCompany}
                      onChange={(e) => {
                        setShippingCompany(e.target.value);
                        if (fieldErrors.city || fieldErrors.address) {
                          setFieldErrors((prev) => ({ ...prev, city: undefined, address: undefined }));
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                    >
                      <option value="dac">🚚 DAC (Agencia Central) - Envío a todo el país</option>
                      <option value="correo">📦 Correo Uruguayo - Envío a todo el país</option>
                      <option value="cotmi">🚍 Agencia COTMI - Envío a todo el país</option>
                      <option value="pickup">📍 Retiro en Local Kamaluso (San José de Mayo)</option>
                    </select>
                  </div>

                  {isPickup ? (
                    /* Tarjeta informativa de retiro presencial */
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                      <p className="font-black flex items-center gap-1.5 text-emerald-800">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Retiro presencial en Local Kamaluso</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        San José de Mayo, Uruguay • Sin costo de envío. Te avisaremos por WhatsApp en cuanto tu paquete esté armado y listo para retirar.
                      </p>
                    </div>
                  ) : (
                    /* Campos de envío por agencia */
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Departamento <span className="text-pink-600">*</span>
                          </label>
                          <select
                            value={customerDepartment}
                            onChange={(e) => setCustomerDepartment(e.target.value)}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                          >
                            {URUGUAY_DEPARTMENTS.map((dep) => (
                              <option key={dep} value={dep}>
                                {dep}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Ciudad / Localidad <span className="text-pink-600">*</span>
                          </label>
                          <input
                            id="field-city"
                            type="text"
                            placeholder="Ej. Las Piedras, Maldonado, Salto..."
                            value={customerCity}
                            onChange={(e) => {
                              setCustomerCity(e.target.value);
                              if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: undefined }));
                            }}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none transition ${
                              fieldErrors.city
                                ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                                : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                            }`}
                          />
                          {fieldErrors.city && (
                            <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{fieldErrors.city}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Modalidad: Domicilio vs Retiro en Agencia */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Lugar de entrega con {getShippingCompanyName()} <span className="text-pink-600">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setDeliveryType("domicilio")}
                            className={`py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                              deliveryType === "domicilio"
                                ? "bg-white text-pink-600 shadow-sm font-extrabold"
                                : "text-slate-600 hover:text-slate-900 font-bold"
                            }`}
                          >
                            <Home className="w-3.5 h-3.5" />
                            <span>Envío a Domicilio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeliveryType("agencia")}
                            className={`py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                              deliveryType === "agencia"
                                ? "bg-white text-pink-600 shadow-sm font-extrabold"
                                : "text-slate-600 hover:text-slate-900 font-bold"
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Retiro en Agencia</span>
                          </button>
                        </div>
                      </div>

                      {deliveryType === "domicilio" ? (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Dirección de Entrega (Calle, N° y Apto) <span className="text-pink-600">*</span>
                          </label>
                          <input
                            id="field-address"
                            type="text"
                            placeholder="Ej. Av. 18 de Julio 1234 Apto 201"
                            value={customerAddress}
                            onChange={(e) => {
                              setCustomerAddress(e.target.value);
                              if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                            }}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none transition ${
                              fieldErrors.address
                                ? "border-red-500 ring-2 ring-red-400/20 bg-red-50/20"
                                : "border-slate-300 focus:ring-2 focus:ring-pink-500"
                            }`}
                          />
                          {fieldErrors.address && (
                            <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{fieldErrors.address}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Sucursal o Terminal de Retiro <span className="text-slate-400 font-normal">(Opcional)</span>
                          </label>
                          <input
                            id="field-address"
                            type="text"
                            placeholder="Ej. Sucursal Centro o Terminal (si lo dejas vacío, enviamos a la principal)"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Despacharemos a la agencia central de tu ciudad para retirar con tu Cédula o Nombre.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Observaciones / Indicaciones para identificar la vivienda (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Casa de rejas negras, portón de madera, entre calles X e Y..."
                          value={customerObservations}
                          onChange={(e) => setCustomerObservations(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SECCIÓN: MÉTODO DE PAGO */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>3. Medio de Pago Preferido</span>
                  </h4>

                  <div className="space-y-1.5">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                    >
                      {PAYMENT_METHODS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {isMp ? (
                      <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-900 font-medium">
                        💳 <strong>Pago Online con Tarjeta:</strong> Podrás abonar directamente en la web con crédito o débito a través de Mercado Pago (aplica 10% de recargo por comisión financiera).
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-medium">
                        📲 <strong>Sin comisiones extra:</strong> Al confirmar, se abrirá WhatsApp con los datos de cuenta (BROU, Prex, OCA Blue, Abitab o Red Pagos) para enviar el comprobante y comenzar el empaque.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {!orderSuccess && cart.length > 0 && (
            <div className="p-3.5 bg-white border-t border-slate-200 space-y-2.5">
              {/* Barra Resumen Compacta */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block leading-none">
                    Total a Pagar
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isPickup ? (
                      <span className="text-emerald-700 font-bold">📍 Retiro en Local Kamaluso</span>
                    ) : (
                      <span>🚚 Flete en destino ({getShippingCompanyName()})</span>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-pink-600 leading-none">
                    ${finalTotal.toLocaleString("es-UY")}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">UYU</span>
                  {isMp && (
                    <span className="block text-[10px] text-sky-700 font-bold leading-tight">
                      (Incluye 10% Mercado Pago)
                    </span>
                  )}
                </div>
              </div>

              {step === 1 ? (
                /* Botón Ir al Paso 2 */
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-pink-600 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider"
                >
                  <span>Continuar con la Compra</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                /* Botones de Finalización de Compra (Paso 2) */
                <div className="space-y-2">
                  {/* Mercado Pago Botón Principal si fue seleccionado */}
                  {isMp ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleMercadoPagoCheckout}
                        disabled={isLoadingMp}
                        className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        {isLoadingMp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        <span>Pagar con Tarjeta (Mercado Pago)</span>
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleWhatsAppAndEmailSubmit}
                          disabled={isSendingOrder}
                          className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 underline transition-colors inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>O confirmar pedido por WhatsApp y abonar por transferencia</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Botón Principal WhatsApp para el resto de medios de pago */
                    <button
                      onClick={handleWhatsAppAndEmailSubmit}
                      disabled={isSendingOrder}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                      {isSendingOrder ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <Mail className="w-4 h-4" />
                        </>
                      )}
                      <span>Confirmar Pedido y Abrir WhatsApp</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setStep(1);
                      setValidationError("");
                      setFieldErrors({});
                      setMpError("");
                    }}
                    className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Volver a modificar productos</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
