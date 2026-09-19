"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  Home,
  Building2,
} from "lucide-react";
import { saveOrder } from "@/lib/orders";
import { getPaymentInstructions } from "@/lib/whatsapp";

const PAYMENT_METHODS = [
  { id: "brou", name: "Transferencia Bancaria BROU" },
  { id: "oca_blue", name: "Depósito OCA Blue" },
  { id: "prex", name: "Prex" },
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
  const [isLoadingMp, setIsLoadingMp] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [validationError, setValidationError] = useState("");

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
    return "Agencia";
  };

  // Recargo de Mercado Pago (+10%)
  const isMp = paymentMethod === "mercado_pago_online";
  const mpSurcharge = isMp ? parseFloat((totalPrice * 0.1).toFixed(2)) : 0;
  const finalTotal = totalPrice + mpSurcharge;

  const scrollToValidationError = () => {
    setTimeout(() => {
      const drawerBody = document.getElementById("cart-drawer-body");
      if (drawerBody) drawerBody.scrollTop = 0;
    }, 50);
  };

  // Validar datos antes de procesar el pedido
  const validateCustomerData = () => {
    if (!customerName.trim()) {
      setValidationError("Por favor ingresa tu Nombre Completo o Empresa.");
      scrollToValidationError();
      return false;
    }
    if (!customerPhone.trim()) {
      setValidationError("Por favor ingresa tu Teléfono o WhatsApp de contacto.");
      scrollToValidationError();
      return false;
    }
    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        setValidationError("Por favor ingresa un Correo Electrónico válido (ej. tuempresa@gmail.com).");
        scrollToValidationError();
        return false;
      }
    }
    if (!customerCity.trim()) {
      setValidationError("Por favor ingresa tu Ciudad / Localidad.");
      scrollToValidationError();
      return false;
    }
    if (!customerAddress.trim() && !isPickup) {
      setValidationError(
        deliveryType === "domicilio"
          ? "Por favor ingresa tu Dirección de entrega a domicilio."
          : "Por favor ingresa la Sucursal o Agencia donde retirarás el paquete."
      );
      scrollToValidationError();
      return false;
    }
    setValidationError("");
    return true;
  };

  // Construir mensaje estructurado, enviar Email a cliente y tienda y abrir WhatsApp
  const handleWhatsAppAndEmailSubmit = async () => {
    if (!validateCustomerData()) return;

    setIsSendingOrder(true);

    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name;
    const selectedShip = getShippingMethodName();
    const orderIdToUse = activeOrderId || `KAM-${Date.now().toString().slice(-6)}`;

    // 0. Registrar/actualizar venta en el sistema evitando duplicados en reintentos
    try {
      const saved = await saveOrder({
        id: orderIdToUse,
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          department: customerDepartment,
          city: customerCity.trim(),
          address: isPickup ? "Retiro en Local (San José)" : customerAddress.trim(),
          observations: customerObservations.trim(),
        },
        items: cart,
        totalPrice,
        finalTotal,
        paymentMethodId: paymentMethod,
        paymentMethodName: selectedPay || paymentMethod,
        shippingMethodName: selectedShip,
        status: "pendiente",
        observations: customerObservations.trim(),
      });
      if (saved && saved.id) setActiveOrderId(saved.id);
    } catch (orderErr) {
      console.error("Error al guardar pedido en historial:", orderErr);
    }

    // 1. Disparar notificación por Correo al cliente y a kamalusosanjose@gmail.com
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToUse,
          cart,
          totalPrice,
          finalTotal,
          paymentMethodId: paymentMethod,
          paymentMethodName: selectedPay,
          shippingMethodName: selectedShip,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            department: customerDepartment,
            city: customerCity.trim(),
            address: isPickup ? "Retiro en Local (San José)" : customerAddress.trim(),
            observations: customerObservations.trim(),
          },
        }),
      });
    } catch (err) {
      console.error("Error al enviar email de confirmación:", err);
    }

    // 2. Construir mensaje estructurado para WhatsApp
    let message = `*NUEVO PEDIDO MAYORISTA #${orderIdToUse} - KAMALUSO SUBLIMACIÓN*\n\n`;

    message += `👤 *DATOS DEL COMPRADOR:*\n`;
    message += `• *Nombre/Empresa:* ${customerName.trim()}\n`;
    message += `• *Teléfono:* ${customerPhone.trim()}\n`;
    if (customerEmail.trim()) {
      message += `• *Email:* ${customerEmail.trim()}\n`;
    }
    message += `• *Ubicación:* ${customerCity.trim()}, ${customerDepartment}\n`;
    message += `• *Dirección/Destino:* ${
      isPickup ? "Retira en Local (San José)" : customerAddress.trim()
    }\n`;
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

    // 3. Instrucciones dinámicas de pago según medio seleccionado
    message += `${getPaymentInstructions(paymentMethod, orderIdToUse)}\n\n`;
    message += `📦 _Despacho coordinado a todo el país. ¡Muchas gracias por tu compra en Kamaluso!_`;

    const url = `https://wa.me/59898615074?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setIsSendingOrder(false);
    clearCart();
    setActiveOrderId(null);
    setIsCartOpen(false);
    setStep(1);
  };

  // Manejar Pago Directo con Mercado Pago
  const handleMercadoPagoCheckout = async () => {
    if (!validateCustomerData()) return;
    if (cart.length === 0) return;

    setIsLoadingMp(true);

    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name;
    const selectedShip = getShippingMethodName();
    const selectedShipId = getShippingMethodId();
    const orderIdToUse = activeOrderId || `KAM-${Date.now().toString().slice(-6)}`;

    // Registrar pedido en el historial de ventas evitando duplicados
    try {
      const saved = await saveOrder({
        id: orderIdToUse,
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          department: customerDepartment,
          city: customerCity.trim(),
          address: isPickup ? "Retiro en Local (San José)" : customerAddress.trim(),
          observations: customerObservations.trim(),
        },
        items: cart,
        totalPrice,
        finalTotal,
        paymentMethodId: paymentMethod,
        paymentMethodName: selectedPay || paymentMethod,
        shippingMethodName: selectedShip,
        status: "pendiente",
        observations: customerObservations.trim(),
      });
      if (saved && saved.id) setActiveOrderId(saved.id);
    } catch (orderErr) {
      console.error("Error al registrar pedido en Mercado Pago:", orderErr);
    }

    // Disparar email informativo también en Mercado Pago
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToUse,
          cart,
          totalPrice,
          finalTotal,
          paymentMethodId: paymentMethod,
          paymentMethodName: selectedPay,
          shippingMethodName: selectedShip,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            department: customerDepartment,
            city: customerCity.trim(),
            address: isPickup ? "Retiro en Local (San José)" : customerAddress.trim(),
            observations: customerObservations.trim(),
          },
        }),
      });
    } catch (err) {
      console.error("Error al enviar email antes de Mercado Pago:", err);
    }

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
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
            address: isPickup ? "Retiro en Local (San José)" : `${customerAddress.trim()}, ${customerCity.trim()}, ${customerDepartment}`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al conectar con Mercado Pago");
      }

      if (data.init_point) {
        clearCart();
        setActiveOrderId(null);
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      alert(`Error al procesar el pago con Mercado Pago: ${err.message}`);
    } finally {
      setIsLoadingMp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
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
                  <span className="text-[10px] bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/40">
                    Paso {step} de 2
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">Kamaluso • San José de Mayo</p>
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
          {cart.length > 0 && (
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

          {/* Body Content con ID para scroll de validaciones */}
          <div id="cart-drawer-body" className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
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
                          src={item.product.images && item.product.images.length > 0 && item.product.images[0] ? item.product.images[0] : "/agenda_fondo_kamaluso.jpg"}
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
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
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
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
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
                  <span>Sin mínimo de compra. Despacho coordinado a todo el país.</span>
                </div>
              </div>
            ) : (
              /* PASO 2: DATOS DEL CLIENTE, ENVÍO Y PAGO */
              <div className="space-y-4">
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl animate-shake">
                    {validationError}
                  </div>
                )}

                {/* Formulario Datos Personales */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-pink-600" />
                    <span>Datos del Comprador / Empresa</span>
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Nombre completo o Empresa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. María García / Imprenta San José"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Teléfono / Celular *
                        </label>
                        <input
                          type="tel"
                          placeholder="Ej. 099 123 456"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          placeholder="tuempresa@gmail.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario Dirección de Envío */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Destino de Envío en Uruguay</span>
                  </h4>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Departamento *
                        </label>
                        <select
                          value={customerDepartment}
                          onChange={(e) => setCustomerDepartment(e.target.value)}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
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
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      {isPickup ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                          <p className="font-bold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Retiro presencial en Local Kamaluso</span>
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            San José de Mayo, Uruguay • Sin costo de envío.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-slate-700">
                            ¿Cómo deseas recibir tu pedido? *
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setDeliveryType("domicilio")}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                deliveryType === "domicilio"
                                  ? "bg-white text-pink-600 shadow-sm font-extrabold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <Home className="w-3.5 h-3.5" />
                              <span>Dirección</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeliveryType("agencia")}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                deliveryType === "agencia"
                                  ? "bg-white text-pink-600 shadow-sm font-extrabold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Retiro en Agencia</span>
                            </button>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              {deliveryType === "domicilio"
                                ? "Dirección de Entrega (Calle, N° y Apto) *"
                                : "Sucursal o Agencia para Retirar *"}
                            </label>
                            <input
                              type="text"
                              placeholder={
                                deliveryType === "domicilio"
                                  ? "Ej. Av. 18 de Julio 1234 Apto 201"
                                  : "Ej. DAC Sucursal Centro, Terminal Tres Cruces, etc."
                              }
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Observaciones de Entrega (Opcional)
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. Entregar en la tarde, casa de la esquina, etc."
                              value={customerObservations}
                              onChange={(e) => setCustomerObservations(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métodos de Pago y Envío */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Medio de Pago Preferido *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                    >
                      {PAYMENT_METHODS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Empresa / Opción de Envío *
                    </label>
                    <select
                      value={shippingCompany}
                      onChange={(e) => setShippingCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                    >
                      <option value="dac">
                        {deliveryType === "domicilio"
                          ? "DAC - Envío a Domicilio"
                          : "DAC - Retiro en Agencia"}
                      </option>
                      <option value="correo">
                        {deliveryType === "domicilio"
                          ? "Correo Uruguayo - Envío a Domicilio"
                          : "Correo Uruguayo - Retiro en Sucursal"}
                      </option>
                      <option value="cotmi">
                        {deliveryType === "domicilio"
                          ? "COTMI - Envío a Domicilio"
                          : "Agencia COTMI - Retiro en Agencia"}
                      </option>
                      <option value="pickup">
                        Retiro en Local (San José de Mayo)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls - Simplificado y Compacto */}
          {cart.length > 0 && (
            <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
              {/* Barra Resumen Compacta */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block leading-none">
                    Total a Pagar
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isPickup ? (
                      <span className="text-emerald-700 font-semibold">📍 Retiro en Local Kamaluso</span>
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
                    <span className="block text-[10px] text-pink-600 font-bold leading-tight">
                      (Incluye 10% Mercado Pago)
                    </span>
                  )}
                </div>
              </div>

              {step === 1 ? (
                /* Botón Ir al Paso 2 */
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-pink-600 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider"
                >
                  <span>Continuar a Datos de Envío</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                /* Botones de Finalización de Compra (Paso 2) */
                <div className="space-y-1.5">
                  {/* Mercado Pago Botón Principal si fue seleccionado */}
                  {isMp ? (
                    <div className="space-y-1.5">
                      <button
                        onClick={handleMercadoPagoCheckout}
                        disabled={isLoadingMp}
                        className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        {isLoadingMp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        <span>Pagar Ahora con Mercado Pago</span>
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleWhatsAppAndEmailSubmit}
                          disabled={isSendingOrder}
                          className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 underline transition-colors inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>O enviar pedido por WhatsApp y abonar por transferencia</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Botón Principal WhatsApp y Correo para el resto de medios de pago */
                    <button
                      onClick={handleWhatsAppAndEmailSubmit}
                      disabled={isSendingOrder}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                      {isSendingOrder ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <Mail className="w-4 h-4" />
                        </>
                      )}
                      <span>Confirmar Pedido por WhatsApp</span>
                    </button>
                  )}

                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Volver a Modificar Productos</span>
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
