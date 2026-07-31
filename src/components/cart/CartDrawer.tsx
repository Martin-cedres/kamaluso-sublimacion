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
} from "lucide-react";
import { saveOrder } from "@/lib/orders";

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

const SHIPPING_METHODS = [
  { id: "dac_domicilio", name: "DAC - Envío a Domicilio" },
  { id: "dac_agencia", name: "DAC - Retiro en Agencia" },
  { id: "correo", name: "Correo Uruguayo - Retiro en Sucursal" },
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

  // Datos del Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDepartment, setCustomerDepartment] = useState("Montevideo");
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Opciones comerciales
  const [paymentMethod, setPaymentMethod] = useState("brou");
  const [shippingMethod, setShippingMethod] = useState("dac_domicilio");
  const [isLoadingMp, setIsLoadingMp] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [validationError, setValidationError] = useState("");

  if (!isCartOpen) return null;

  // Recargo de Mercado Pago (+10%)
  const isMp = paymentMethod === "mercado_pago_online";
  const mpSurcharge = isMp ? parseFloat((totalPrice * 0.1).toFixed(2)) : 0;
  const finalTotal = totalPrice + mpSurcharge;

  // Validar datos antes de procesar el pedido
  const validateCustomerData = () => {
    if (!customerName.trim()) {
      setValidationError("Por favor ingresa tu Nombre Completo o Empresa.");
      return false;
    }
    if (!customerPhone.trim()) {
      setValidationError("Por favor ingresa tu Teléfono o WhatsApp de contacto.");
      return false;
    }
    if (customerEmail.trim()) {
      if (!customerEmail.includes("@") || !customerEmail.includes(".")) {
        setValidationError("Por favor ingresa un Correo Electrónico válido o déjalo en blanco.");
        return false;
      }
    }
    if (!customerCity.trim()) {
      setValidationError("Por favor ingresa tu Ciudad / Localidad.");
      return false;
    }
    if (!customerAddress.trim() && shippingMethod !== "pickup") {
      setValidationError("Por favor ingresa tu Dirección o Agencia de envío.");
      return false;
    }
    setValidationError("");
    return true;
  };

  // Construir mensaje estructurado, enviar Email a kamalusosanjose@gmail.com y abrir WhatsApp
  const handleWhatsAppAndEmailSubmit = async () => {
    if (!validateCustomerData()) return;

    setIsSendingOrder(true);

    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name;
    const selectedShip = SHIPPING_METHODS.find((s) => s.id === shippingMethod)?.name;

    // 0. Registrar venta en el sistema (Historial de Pedidos Admin)
    try {
      await saveOrder({
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          department: customerDepartment,
          city: customerCity.trim(),
          address: shippingMethod === "pickup" ? "Retiro en Local (San José)" : customerAddress.trim(),
        },
        items: cart,
        totalPrice,
        finalTotal,
        paymentMethodId: paymentMethod,
        paymentMethodName: selectedPay || paymentMethod,
        shippingMethodName: selectedShip || shippingMethod,
        status: "pendiente",
      });
    } catch (orderErr) {
      console.error("Error al guardar pedido en historial:", orderErr);
    }

    // 1. Disparar notificación por Correo a kamalusosanjose@gmail.com
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
            address: shippingMethod === "pickup" ? "Retiro en Local (San José)" : customerAddress.trim(),
          },
        }),
      });
    } catch (err) {
      console.error("Error al enviar email de confirmación:", err);
    }

    // 2. Construir mensaje estructurado para WhatsApp
    let message = `*NUEVO PEDIDO MAYORISTA - KAMALUSO SUBLIMACIÓN*\n\n`;

    message += `👤 *DATOS DEL COMPRADOR:*\n`;
    message += `• *Nombre/Empresa:* ${customerName.trim()}\n`;
    message += `• *Teléfono:* ${customerPhone.trim()}\n`;
    message += `• *Email:* ${customerEmail.trim() || "No especificado"}\n`;
    message += `• *Ubicación:* ${customerCity.trim()}, ${customerDepartment}\n`;
    message += `• *Dirección/Destino:* ${
      shippingMethod === "pickup" ? "Retira en Local (San José)" : customerAddress.trim()
    }\n\n`;

    message += `📦 *PRODUCTOS SOLICITADOS:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (x${item.quantity}) - $${(
        item.product.price * item.quantity
      ).toLocaleString("es-UY")} UYU\n`;
    });

    message += `\n💰 *SUBTOTAL PRODUCTOS:* $${totalPrice.toLocaleString("es-UY")} UYU\n`;

    if (isMp) {
      message += `💳 *RECARGO MERCADO PAGO (10%):* $${mpSurcharge.toLocaleString("es-UY")} UYU\n`;
      message += `💵 *TOTAL FINAL:* $${finalTotal.toLocaleString("es-UY")} UYU\n`;
    } else {
      message += `💵 *TOTAL A PAGAR:* $${finalTotal.toLocaleString("es-UY")} UYU\n`;
    }

    message += `\n💳 *MÉTODO DE PAGO:* ${selectedPay}\n`;
    message += `🚚 *FORMA DE ENVÍO:* ${selectedShip}\n`;

    message += `\n_Quedo a la espera del envío de datos bancarios para realizar el pago. ¡Gracias!_`;

    const url = `https://wa.me/59898615074?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setIsSendingOrder(false);
    clearCart();
    setIsCartOpen(false);
    setStep(1);
  };

  // Manejar Pago Directo con Mercado Pago
  const handleMercadoPagoCheckout = async () => {
    if (!validateCustomerData()) return;
    if (cart.length === 0) return;

    setIsLoadingMp(true);

    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name;
    const selectedShip = SHIPPING_METHODS.find((s) => s.id === shippingMethod)?.name;

    // Registrar pedido en el historial de ventas
    try {
      await saveOrder({
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          department: customerDepartment,
          city: customerCity.trim(),
          address: shippingMethod === "pickup" ? "Retiro en Local (San José)" : customerAddress.trim(),
        },
        items: cart,
        totalPrice,
        finalTotal,
        paymentMethodId: paymentMethod,
        paymentMethodName: selectedPay || paymentMethod,
        shippingMethodName: selectedShip || shippingMethod,
        status: "pendiente",
      });
    } catch (orderErr) {
      console.error("Error al registrar pedido en Mercado Pago:", orderErr);
    }

    // Disparar email informativo también en Mercado Pago
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          totalPrice,
          finalTotal,
          paymentMethodName: selectedPay,
          shippingMethodName: selectedShip,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            department: customerDepartment,
            city: customerCity.trim(),
            address: shippingMethod === "pickup" ? "Retiro en Local (San José)" : customerAddress.trim(),
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
          items: cart,
          paymentMethod,
          shippingMethod,
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
            address: `${customerAddress.trim()}, ${customerCity.trim()}, ${customerDepartment}`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al conectar con Mercado Pago");
      }

      if (data.init_point) {
        clearCart();
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      alert(`Error al procesar el pago con Mercado Pago: ${err.message}`);
    } finally {
      setIsLoadingMp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
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
                  <span>Tu Carrito B2B</span>
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

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                          src={item.product.images[0]}
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
                  <span>Sin mínimo de compra. Despacho ágil en ~48hs a todo Uruguay.</span>
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
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
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
                          Correo Electrónico (Opcional)
                        </label>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com (opcional)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario Dirección de Envío */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
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
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        {shippingMethod === "pickup"
                          ? "Punto de Retiro"
                          : "Dirección o Agencia de Preferencia *"}
                      </label>
                      {shippingMethod === "pickup" ? (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                          📍 Retiro presencial en Local Kamaluso (San José de Mayo).
                        </p>
                      ) : (
                        <input
                          type="text"
                          placeholder="Ej. Av. 18 de Julio 1234 Apto 201 o Agencia DAC Centro"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Métodos de Pago y Envío */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Medio de Pago Preferido *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                    >
                      {PAYMENT_METHODS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Empresa / Opción de Envío *
                    </label>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                    >
                      {SHIPPING_METHODS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Subtotal Insumos</span>
                  <span className="font-bold text-slate-800">
                    ${totalPrice.toLocaleString("es-UY")} UYU
                  </span>
                </div>
                {isMp && (
                  <div className="flex justify-between items-center text-xs text-pink-600 font-semibold">
                    <span>Recargo Mercado Pago (+10%)</span>
                    <span>+${mpSurcharge.toLocaleString("es-UY")} UYU</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 mt-1">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Total a Pagar:
                  </span>
                  <div className="flex items-baseline gap-1 text-right">
                    <span className="text-2xl sm:text-3xl font-black text-pink-600 leading-none">
                      ${finalTotal.toLocaleString("es-UY")}
                    </span>
                    <span className="text-xs font-bold text-slate-500">UYU</span>
                  </div>
                </div>
              </div>

              {step === 1 ? (
                /* Botón Ir al Paso 2 */
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-pink-600 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider"
                >
                  <span>Continuar a Datos de Envío</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                /* Botones de Finalización de Compra (Paso 2) */
                <div className="space-y-2">
                  {/* Mercado Pago Botón Directo si fue seleccionado */}
                  {isMp && (
                    <button
                      onClick={handleMercadoPagoCheckout}
                      disabled={isLoadingMp}
                      className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs"
                    >
                      {isLoadingMp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>Pagar Ahora con Mercado Pago</span>
                    </button>
                  )}

                  {/* Botón Principal WhatsApp y Correo */}
                  <button
                    onClick={handleWhatsAppAndEmailSubmit}
                    disabled={isSendingOrder}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSendingOrder ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <Mail className="w-4 h-4" />
                      </>
                    )}
                    <span>Enviar Pedido por WhatsApp y Correo</span>
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
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
