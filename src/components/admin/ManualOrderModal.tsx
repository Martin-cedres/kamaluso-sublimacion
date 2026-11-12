"use client";

import React, { useState, useEffect } from "react";
import { Product, Order, OrderStatus, CartItem } from "@/types";
import { saveOrder } from "@/lib/orders";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  DollarSign,
  CheckCircle2,
  Loader2,
  PackagePlus,
  Edit2,
} from "lucide-react";

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orderToEdit?: Order | null;
  onOrderCreated: (newOrder: Order) => void;
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

const SHIPPING_OPTIONS = [
  "Retiro en Local (San José de Mayo)",
  "DAC - Retiro en Agencia",
  "DAC - Envío a Domicilio",
  "Correo Uruguayo - Retiro en Sucursal",
  "Correo Uruguayo - Envío a Domicilio",
  "Agencia COTMI - Retiro en Agencia",
  "COTMI - Envío a Domicilio",
];

export default function ManualOrderModal({
  isOpen,
  onClose,
  products,
  orderToEdit,
  onOrderCreated,
}: ManualOrderModalProps) {
  // Datos del Cliente (100% Opcionales)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDepartment, setCustomerDepartment] = useState("San José");
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerObservations, setCustomerObservations] = useState("");

  // Ítems del Pedido (100% Opcionales)
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState("");
  const [catalogQuantity, setCatalogQuantity] = useState(1);

  // Ítem Manual Personalizado
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState<number | "">("");
  const [customItemQuantity, setCustomItemQuantity] = useState(1);
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);

  // Precios y Condiciones (100% Opcionales)
  const [customTotalPrice, setCustomTotalPrice] = useState<number | "">("");
  const [paymentMethodId, setPaymentMethodId] = useState("brou");
  const [shippingMethodName, setShippingMethodName] = useState("Retiro en Local (San José de Mayo)");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pago_confirmado");

  // Estado de guardado
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar o limpiar formulario al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    if (orderToEdit) {
      setCustomerName(orderToEdit.customer?.name || "");
      setCustomerPhone(orderToEdit.customer?.phone || "");
      setCustomerEmail(orderToEdit.customer?.email || "");
      setCustomerDepartment(orderToEdit.customer?.department || "San José");
      setCustomerCity(orderToEdit.customer?.city || "");
      setCustomerAddress(orderToEdit.customer?.address || "");
      setCustomerObservations(
        orderToEdit.customer?.observations || orderToEdit.observations || ""
      );

      const loadedItems = Array.isArray(orderToEdit.items)
        ? orderToEdit.items.map((i) => ({
            ...i,
            product: { ...i.product },
          }))
        : [];
      setItems(loadedItems);

      const resolvedPayId =
        orderToEdit.paymentMethodId ||
        PAYMENT_METHODS.find((p) => p.name === orderToEdit.paymentMethodName)?.id ||
        "brou";
      setPaymentMethodId(resolvedPayId);

      const resolvedShipName =
        orderToEdit.shippingMethodName || "Retiro en Local (San José de Mayo)";
      setShippingMethodName(resolvedShipName);
      setOrderStatus(orderToEdit.status || "pago_confirmado");

      // Verificar si el total guardado fue sobreescrito manualmente
      const itemsSub = loadedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const lowShip = resolvedShipName.toLowerCase();
      const shipCost =
        (lowShip.includes("correo") || lowShip.includes("cotmi")) &&
        lowShip.includes("domicilio")
          ? 200
          : 0;
      const mpExtra =
        resolvedPayId === "mercado_pago_online"
          ? parseFloat(((itemsSub + shipCost) * 0.1).toFixed(2))
          : 0;
      const expectedAutoTotal = itemsSub + shipCost + mpExtra;

      if (
        typeof orderToEdit.finalTotal === "number" &&
        Math.abs(orderToEdit.finalTotal - expectedAutoTotal) > 0.01
      ) {
        setCustomTotalPrice(orderToEdit.finalTotal);
      } else {
        setCustomTotalPrice("");
      }
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerDepartment("San José");
      setCustomerCity("");
      setCustomerAddress("");
      setCustomerObservations("");
      setItems([]);
      setCustomTotalPrice("");
      setPaymentMethodId("brou");
      setShippingMethodName("Retiro en Local (San José de Mayo)");
      setOrderStatus("pago_confirmado");
    }

    setSelectedCatalogProductId("");
    setCatalogQuantity(1);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQuantity(1);
    setShowCustomItemForm(false);
  }, [isOpen, orderToEdit]);

  if (!isOpen) return null;

  const isEditing = Boolean(orderToEdit);

  // Calcular subtotal de los ítems agregados
  const computedItemsTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const lowerShip = shippingMethodName.toLowerCase();
  const shippingCost =
    (lowerShip.includes("correo") || lowerShip.includes("cotmi")) &&
    lowerShip.includes("domicilio")
      ? 200
      : 0;

  const isMp = paymentMethodId === "mercado_pago_online";
  const mpSurcharge = isMp
    ? parseFloat(((computedItemsTotal + shippingCost) * 0.1).toFixed(2))
    : 0;
  const autoCalculatedTotal = computedItemsTotal + shippingCost + mpSurcharge;
  const effectiveTotal =
    customTotalPrice !== "" ? Number(customTotalPrice) : autoCalculatedTotal;

  // Agregar ítem desde catálogo
  const handleAddCatalogProduct = () => {
    if (!selectedCatalogProductId) return;
    const prod = products.find((p) => p.id === selectedCatalogProductId);
    if (!prod) return;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.product.id === prod.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + catalogQuantity,
        };
        return updated;
      }
      return [...prev, { product: prod, quantity: catalogQuantity }];
    });

    setSelectedCatalogProductId("");
    setCatalogQuantity(1);
  };

  // Agregar ítem manual libre
  const handleAddCustomProduct = () => {
    const name = customItemName.trim() || "Insumo / Trabajo Personalizado";
    const unitPrice = customItemPrice !== "" ? Number(customItemPrice) : 0;
    const qty = Math.max(1, customItemQuantity);

    const dummyProduct: Product = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      slug: "personalizado",
      description: "Producto ingresado manualmente desde administración",
      price: unitPrice,
      currency: "UYU",
      category: "manual",
      images: [],
      inStock: true,
    };

    setItems((prev) => [...prev, { product: dummyProduct, quantity: qty }]);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQuantity(1);
    setShowCustomItemForm(false);
  };

  // Cambiar cantidad de un ítem en la tabla
  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const nextQty = updated[index].quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: nextQty };
      return updated;
    });
  };

  // Eliminar ítem
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Guardar pedido manual o editado (SIN RESTRICCIONES NI CAMPOS OBLIGATORIOS)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const paymentName =
        PAYMENT_METHODS.find((p) => p.id === paymentMethodId)?.name ||
        orderToEdit?.paymentMethodName ||
        "Transferencia Bancaria BROU";

      const lowerShip = shippingMethodName.toLowerCase();
      let deliveryType: "agencia" | "domicilio" | "local" = "agencia";
      if (lowerShip.includes("local")) {
        deliveryType = "local";
      } else if (lowerShip.includes("domicilio")) {
        deliveryType = "domicilio";
      } else if (lowerShip.includes("agencia") || lowerShip.includes("sucursal")) {
        deliveryType = "agencia";
      }

      const finalOrder = await saveOrder({
        ...(orderToEdit || {}),
        id: orderToEdit?.id || `KAM-MAN-${Date.now().toString().slice(-6)}`,
        createdAt: orderToEdit?.createdAt || new Date().toISOString(),
        customer: {
          name: customerName.trim() || "Cliente Mostrador / WhatsApp",
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          department: customerDepartment,
          city: customerCity.trim(),
          address: customerAddress.trim() || shippingMethodName,
          observations: customerObservations.trim(),
          deliveryType,
        },
        items,
        totalPrice: computedItemsTotal > 0 ? computedItemsTotal : effectiveTotal,
        shippingCost,
        finalTotal: effectiveTotal,
        paymentMethodId,
        paymentMethodName: paymentName,
        shippingMethodName,
        status: orderStatus,
        observations: customerObservations.trim(),
        deliveryType,
      });

      onOrderCreated(finalOrder);
      onClose();
    } catch (error) {
      console.error("Error al guardar pedido:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const shippingOptionsList = SHIPPING_OPTIONS.includes(shippingMethodName)
    ? SHIPPING_OPTIONS
    : [shippingMethodName, ...SHIPPING_OPTIONS];

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-600 rounded-xl text-white shadow-md">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>
                  {isEditing ? `Editar Pedido #${orderToEdit?.id}` : "Ingresar Pedido Manual"}
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  {isEditing ? "Modo Edición" : "Fuera de Web"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? "Modifica datos del cliente, productos, envío o importe total"
                  : "Ventas por WhatsApp, mostrador o taller • Ningún campo es obligatorio"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* 1. Datos del Cliente */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-pink-600" />
              <span>1. Datos del Cliente (Opcional)</span>
            </h4>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Nombre o Empresa
                </label>
                <input
                  type="text"
                  placeholder="Ej. María Gómez / Taller Gráfico San José (Opcional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 099 123 456 (Opcional)"
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
                    placeholder="cliente@gmail.com (Opcional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Departamento
                  </label>
                  <select
                    value={customerDepartment}
                    onChange={(e) => setCustomerDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  >
                    {URUGUAY_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
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
                    placeholder="Ej. San José de Mayo (Opcional)"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Dirección o Punto de Entrega
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. 18 de Julio 1234 o Agencia DAC Centro (Opcional)"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Observaciones / Indicaciones para identificar la vivienda
                </label>
                <input
                  type="text"
                  placeholder="Ej. Casa de rejas negras, portón de madera, entre calles X e Y, timbre... (Opcional)"
                  value={customerObservations}
                  onChange={(e) => setCustomerObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Productos / Ítems del Pedido */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>2. Ítems del Pedido (Opcional)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomItemForm(!showCustomItemForm)}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{showCustomItemForm ? "Cerrar concepto libre" : "Agregar ítem libre / a medida"}</span>
              </button>
            </div>

            {/* Selector desde Catálogo */}
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Agregar producto del catálogo
                </label>
                <select
                  value={selectedCatalogProductId}
                  onChange={(e) => setSelectedCatalogProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price} UYU)
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={catalogQuantity}
                  onChange={(e) => setCatalogQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleAddCatalogProduct}
                disabled={!selectedCatalogProductId}
                className="w-full sm:w-auto py-2 px-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Formulario Ítem Libre / Personalizado */}
            {showCustomItemForm && (
              <div className="p-3 bg-white rounded-xl border border-pink-200 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] font-bold text-pink-700">Nuevo ítem o trabajo a medida:</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Descripción del ítem (ej. Cuadernos tapa dura)"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Precio unit. ($)"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant."
                      value={customItemQuantity}
                      onChange={(e) => setCustomItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-center"
                      title="Cantidad"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleAddCustomProduct}
                    className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir a la lista</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de Ítems Cargados */}
            {items.length > 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                      <th className="py-2 px-3">Producto / Concepto</th>
                      <th className="py-2 px-2 text-center">Cant.</th>
                      <th className="py-2 px-3 text-right">Precio Unit.</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                      <th className="py-2 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.product.name}</td>
                        <td className="py-2 px-2 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(idx, -1)}
                              className="p-0.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition"
                              title="Restar 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-slate-800 px-1.5 min-w-[22px] text-center">
                              x{item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(idx, 1)}
                              className="p-0.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition"
                              title="Sumar 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">${item.product.price}</td>
                        <td className="py-2 px-3 text-right font-black text-pink-600">
                          ${item.product.price * item.quantity}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="Quitar ítem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                Sin productos seleccionados. Puedes dejarlo vacío y solo colocar el total abajo si lo prefieres.
              </p>
            )}
          </div>

          {/* 3. Condiciones de Pago, Envío y Total */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>3. Total, Pago & Envío</span>
            </h4>

            {/* Empresa / Opción de Envío */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Empresa / Forma de Envío
              </label>
              <select
                value={shippingMethodName}
                onChange={(e) => setShippingMethodName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              >
                {shippingOptionsList.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {/* Leyenda informativa clara */}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                ℹ️ <strong>Reglas de envío:</strong> Correo Uruguayo y COTMI a domicilio suman <strong>+$200 UYU</strong>; retiros en agencia (DAC, Correo, COTMI) y envíos por DAC son a cargo del comprador en destino ($0 aquí); retiro en taller sin costo ($0). Despacho en agencia en San José siempre sin cargo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Medio de Pago */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Medio de Pago
                </label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado Inicial */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Estado del Pedido
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  <option value="pago_confirmado">💳 Pago Confirmado</option>
                  <option value="pendiente">⏳ Pendiente de Pago</option>
                  <option value="en_preparacion">📦 En Preparación</option>
                  <option value="despachado">🚚 Despachado</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>

            {/* Total y Desglose Detallado */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="w-full sm:w-52">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Total a Pagar ($ UYU)
                  </label>
                  <input
                    type="number"
                    placeholder={String(autoCalculatedTotal)}
                    value={customTotalPrice}
                    onChange={(e) =>
                      setCustomTotalPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-pink-300 rounded-xl text-xs font-black text-pink-600 bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {customTotalPrice !== ""
                      ? "✏️ Monto manual sobreescrito"
                      : `Sugerido automático: $${autoCalculatedTotal} UYU`}
                  </span>
                </div>

                {/* Desglose */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 flex-1 sm:max-w-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Ítems:</span>
                    <span className="font-mono font-bold">${computedItemsTotal.toLocaleString("es-UY")} UYU</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío:</span>
                    <span className="font-mono font-bold">
                      {shippingCost > 0
                        ? "+$200 UYU (Domicilio Correo/COTMI)"
                        : lowerShip.includes("local")
                        ? "$0 (Retiro en taller)"
                        : "$0 (Pago en destino por comprador)"}
                    </span>
                  </div>
                  {isMp && (
                    <div className="flex justify-between text-pink-600 font-semibold">
                      <span>Recargo MP (+10%):</span>
                      <span className="font-mono font-bold">+${mpSurcharge.toLocaleString("es-UY")} UYU</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900">
                    <span>Total Sugerido:</span>
                    <span className="font-mono text-pink-600 font-black">
                      ${autoCalculatedTotal.toLocaleString("es-UY")} UYU
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">
              Total Registrado
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-pink-600">
                ${effectiveTotal.toLocaleString("es-UY")}{" "}
                <span className="text-xs font-bold text-slate-500">UYU</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                (Ítems: ${computedItemsTotal} UYU • Envío: {shippingCost > 0 ? "+$200 UYU" : lowerShip.includes("local") ? "$0 (Taller)" : "$0 (Destino)"}{isMp ? ` • Recargo MP: +$${mpSurcharge} UYU` : ""})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md shadow-pink-600/20 text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isEditing ? "Guardar Cambios" : "Guardar Pedido"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
