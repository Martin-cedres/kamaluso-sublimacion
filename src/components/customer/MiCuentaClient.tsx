"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Customer, Order, OrderStatus, Product } from "@/types";
import { CustomerTopProduct, resolveShippingMethodNameFromCustomer } from "@/lib/customers";
import {
  CUSTOMER_PAYMENT_METHODS,
  formatRutInfo,
  parseRutInfo,
  stripAgencyPrefix,
  URUGUAY_DEPARTMENTS,
} from "@/lib/checkout-constants";
import { useCart } from "@/components/cart/CartContext";
import { CustomerOtpLoginCard } from "@/components/customer/CustomerOtpLoginCard";
import {
  ShoppingBag,
  Package,
  User,
  LogOut,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Building2,
  Home,
  CreditCard,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  ShoppingCart,
  Send,
  ShieldCheck,
  Save,
} from "lucide-react";

interface AccountResponse {
  email: string;
  customer: Customer | null;
  orders: Order[];
  topProducts: CustomerTopProduct[];
}

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pendiente: {
    label: "⏳ Pendiente de pago / confirmación",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  pago_confirmado: {
    label: "💳 Pago confirmado",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  en_preparacion: {
    label: "📦 En preparación en taller",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  despachado: {
    label: "🚚 Despachado",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  cancelado: {
    label: "❌ Cancelado",
    className: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

export default function MiCuentaClient() {
  const router = useRouter();
  const { cart, addToCart, updateQuantity, setIsCartOpen } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "top" | "profile">("orders");
  const [repeatNotice, setRepeatNotice] = useState<{
    orderId: string;
    addedCount: number;
    unavailable: string[];
  } | null>(null);

  // Estado del formulario de perfil
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasRut, setHasRut] = useState(false);
  const [rut, setRut] = useState("");
  const [company, setCompany] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"agencia" | "domicilio" | "local">("agencia");
  const [shippingAgency, setShippingAgency] = useState<"dac" | "correo" | "cotmi">("dac");
  const [department, setDepartment] = useState("Montevideo");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("brou");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const hydrateProfileForm = useCallback((c: Customer | null) => {
    if (!c) return;
    setName(c.name || "");
    setPhone(c.phone || "");

    const parsedRut = parseRutInfo(c.rutInfo);
    setHasRut(parsedRut.hasRut);
    setRut(parsedRut.rut);
    setCompany(parsedRut.company);

    const resolvedShip = resolveShippingMethodNameFromCustomer(c).toLowerCase();
    const nextDelivery: "agencia" | "domicilio" | "local" =
      c.deliveryType === "local" || resolvedShip.includes("local")
        ? "local"
        : c.deliveryType === "domicilio" || resolvedShip.includes("domicilio")
        ? "domicilio"
        : "agencia";
    setDeliveryMode(nextDelivery);

    if (c.shippingCompany === "cotmi" || resolvedShip.includes("cotmi")) {
      setShippingAgency("cotmi");
    } else if (c.shippingCompany === "correo" || resolvedShip.includes("correo")) {
      setShippingAgency("correo");
    } else {
      setShippingAgency("dac");
    }

    setDepartment(c.department || "Montevideo");
    setCity(c.city || "");
    setAddress(
      nextDelivery === "agencia"
        ? stripAgencyPrefix(c.address)
        : nextDelivery === "local"
        ? ""
        : c.address || ""
    );
    setObservations(c.observations || "");
    setPaymentMethodId(c.paymentMethodId || "brou");
  }, []);

  const fetchAccountData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [meRes, prodRes] = await Promise.all([
        fetch("/api/customer/me", { cache: "no-store" }),
        fetch("/api/products").catch(() => null),
      ]);

      if (prodRes && prodRes.ok) {
        const prods = await prodRes.json().catch(() => []);
        if (Array.isArray(prods)) {
          setCatalogProducts(prods as Product[]);
        }
      }

      if (meRes.status === 401) {
        setAccount(null);
        return;
      }

      if (meRes.ok) {
        const data = (await meRes.json()) as AccountResponse;
        setAccount(data);
        hydrateProfileForm(data.customer);
      }
    } catch {
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, [hydrateProfileForm]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const productLookup = useMemo(() => {
    const byId = new Map<string, Product>();
    const bySlug = new Map<string, Product>();
    const byName = new Map<string, Product>();

    for (const p of catalogProducts) {
      if (!p) continue;
      if (p.id) byId.set(p.id, p);
      if (p.slug) bySlug.set(p.slug, p);
      if (p.name) byName.set(p.name.trim().toLowerCase(), p);
    }

    return { byId, bySlug, byName };
  }, [catalogProducts]);

  const findLiveProduct = useCallback(
    (itemProduct: { id?: string; slug?: string; name?: string }): Product | undefined => {
      if (itemProduct.id && productLookup.byId.has(itemProduct.id)) {
        return productLookup.byId.get(itemProduct.id);
      }
      if (itemProduct.slug && productLookup.bySlug.has(itemProduct.slug)) {
        return productLookup.bySlug.get(itemProduct.slug);
      }
      if (itemProduct.name) {
        return productLookup.byName.get(itemProduct.name.trim().toLowerCase());
      }
      return undefined;
    },
    [productLookup]
  );

  const handleRepeatOrder = (order: Order) => {
    if (!Array.isArray(order.items) || order.items.length === 0) return;

    let addedCount = 0;
    const unavailable: string[] = [];

    for (const item of order.items) {
      if (!item?.product) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const live = findLiveProduct(item.product);
      const targetProduct = live || item.product;

      if (live && !live.inStock) {
        unavailable.push(live.name);
        continue;
      }

      addToCart(targetProduct, qty, false);
      addedCount += qty;
    }

    setRepeatNotice({
      orderId: order.id,
      addedCount,
      unavailable,
    });

    if (addedCount > 0) {
      setIsCartOpen(true);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/customer/auth/logout", { method: "POST" }).catch(() => {});
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kamaluso-customer-auth-changed"));
    }
    setAccount(null);
  };

  const buildShippingMethodName = (): string => {
    if (deliveryMode === "local") return "Retiro en Local (San José de Mayo)";
    const agencyLabel =
      shippingAgency === "correo"
        ? "Correo Uruguayo"
        : shippingAgency === "cotmi"
        ? "COTMI"
        : "DAC";
    if (deliveryMode === "domicilio") {
      return `${agencyLabel} - Envío a Domicilio`;
    }
    return shippingAgency === "cotmi"
      ? "Agencia COTMI - Retiro en Agencia"
      : shippingAgency === "correo"
      ? "Correo Uruguayo - Retiro en Sucursal"
      : "DAC - Retiro en Agencia";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(null);
    setProfileErrorMsg(null);

    if (!name.trim()) {
      setProfileErrorMsg("Ingresá tu nombre completo o empresa.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const shippingMethodName = buildShippingMethodName();
      const res = await fetch("/api/customer/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          department: deliveryMode === "local" ? "San José" : department,
          city: deliveryMode === "local" ? "San José de Mayo" : city.trim(),
          address:
            deliveryMode === "local"
              ? "Retiro en Local Kamaluso (San José de Mayo)"
              : address.trim(),
          deliveryType: deliveryMode,
          shippingCompany: deliveryMode === "local" ? "local" : shippingAgency,
          shippingMethodName,
          paymentMethodId,
          observations: observations.trim(),
          rutInfo: hasRut ? formatRutInfo(rut, company) : "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setProfileErrorMsg(data.error || "No pudimos guardar tus datos.");
        return;
      }

      setAccount((prev) =>
        prev ? { ...prev, customer: data.customer as Customer } : prev
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kamaluso-customer-auth-changed"));
      }
      setProfileSavedMsg("¡Tus datos y preferencias se guardaron correctamente!");
      setTimeout(() => setProfileSavedMsg(null), 4000);
    } catch {
      setProfileErrorMsg("Error de conexión al guardar.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Cargando tu cuenta...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal de Clientes Kamaluso</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tu historial de compras y recompra rápida
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Accedé en segundos con un código de 6 dígitos en tu correo. Sin contraseñas para recordar.
          </p>
        </div>

        <CustomerOtpLoginCard
          onAuthenticated={() => {
            fetchAccountData();
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h3 className="font-extrabold text-slate-900">Historial completo</h3>
            <p className="text-slate-600 leading-relaxed">
              Mirá todos tus pedidos hechos por la web o coordinados por taller y su estado en tiempo real.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <RotateCcw className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900">Repetir en 1 clic</h3>
            <p className="text-slate-600 leading-relaxed">
              Volvé a cargar al carrito los insumos de una compra anterior sin buscar producto por producto.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-slate-900">Datos recordados</h3>
            <p className="text-slate-600 leading-relaxed">
              Guardá tu agencia DAC/Correo/COTMI, domicilio, RUT y medio de pago para un checkout instantáneo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { customer, orders, topProducts } = account;
  const displayName = customer?.name || account.email.split("@")[0];
  const lastOrderDate = orders[0]?.createdAt
    ? new Date(orders[0].createdAt).toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin pedidos aún";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Header de Cuenta */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black truncate">
                ¡Hola, {displayName}!
              </h1>
              {orders.length > 1 && (
                <span className="text-[10px] font-extrabold bg-pink-500/25 text-pink-200 border border-pink-400/40 px-2.5 py-0.5 rounded-full uppercase">
                  Cliente Frecuente
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 truncate">{account.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/#catalogo"
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Ir al Catálogo</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              Pedidos registrados
            </span>
            <span className="text-2xl font-black text-slate-900">{orders.length}</span>
          </div>
          <ShoppingBag className="w-6 h-6 text-pink-500" />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              Última compra
            </span>
            <span className="text-base font-black text-slate-900">{lastOrderDate}</span>
          </div>
          <Clock className="w-6 h-6 text-purple-500" />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              Entrega habitual
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block">
              {customer ? resolveShippingMethodNameFromCustomer(customer) : "Sin definir aún"}
            </span>
          </div>
          <Truck className="w-6 h-6 text-emerald-500 shrink-0" />
        </div>
      </div>

      {repeatNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5 text-emerald-950">
            <p className="font-black flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Cargamos {repeatNotice.addedCount} unidades del pedido #{repeatNotice.orderId} a tu carrito.
              </span>
            </p>
            {repeatNotice.unavailable.length > 0 && (
              <p className="text-amber-800 font-semibold">
                Sin stock actualmente (no agregados): {repeatNotice.unavailable.join(", ")}.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl inline-flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
          >
            <span>Ir al Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pestañas de Navegación */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "orders"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Mis Pedidos ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("top")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "top"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tus Insumos Habituales ({topProducts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "profile"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mis Datos y Envío</span>
        </button>
      </div>

      {/* TAB 1: MIS PEDIDOS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">
                  Todavía no tenés pedidos con este correo
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cuando realices tu primera compra o carguemos un pedido a tu correo, aparecerá acá para repetirlo en 1 clic.
                </p>
              </div>
              <Link
                href="/#catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusMeta =
                ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pendiente;
              const isTransferPending =
                order.status === "pendiente" &&
                order.paymentMethodId !== "mercado_pago_online" &&
                order.paymentMethodId !== "efectivo";
              const waUrl = `https://wa.me/59898615074?text=${encodeURIComponent(
                `Hola Kamaluso, les escribo por mi pedido #${order.id} (${account.email}).`
              )}`;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-black text-sm text-slate-900">
                        #{order.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString("es-UY", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRepeatOrder(order)}
                          className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Repetir pedido</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="divide-y divide-slate-100">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div
                            key={`${order.id}-${item.product?.id || idx}`}
                            className="py-2 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {item.product?.name || "Insumo Kamaluso"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {item.quantity} u. × $
                                {Number(item.product?.price || 0).toLocaleString("es-UY")} UYU
                              </p>
                            </div>
                            <span className="font-black text-slate-800 whitespace-nowrap">
                              $
                              {(
                                Number(item.product?.price || 0) *
                                Number(item.quantity || 1)
                              ).toLocaleString("es-UY")}{" "}
                              UYU
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 py-2">
                          Pedido registrado en taller sin detalle de ítems online.
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 text-slate-600">
                        <p>
                          <strong className="text-slate-800">Entrega:</strong>{" "}
                          {order.shippingMethodName || "A coordinar"}
                          {order.customer?.address ? ` • ${order.customer.address}` : ""}
                        </p>
                        <p>
                          <strong className="text-slate-800">Pago:</strong>{" "}
                          {order.paymentMethodName || order.paymentMethodId}
                        </p>
                        {order.discountAmount && order.discountAmount > 0 ? (
                          <p className="text-emerald-700 font-bold">
                            Descuento aplicado
                            {order.discountType === "percent" && order.discountValue
                              ? ` (${order.discountValue}%)`
                              : ""}
                            : -${Number(order.discountAmount).toLocaleString("es-UY")} UYU
                            {order.discountReason ? ` • ${order.discountReason}` : ""}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {isTransferPending && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar comprobante</span>
                          </a>
                        )}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Total del pedido
                          </span>
                          <span className="text-lg font-black text-pink-600">
                            ${Number(order.finalTotal || order.totalPrice || 0).toLocaleString("es-UY")}{" "}
                            <span className="text-xs text-slate-500 font-bold">UYU</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: TUS INSUMOS HABITUALES */}
      {activeTab === "top" && (
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
              Aún no tenemos suficiente historial de productos para armar tus insumos habituales.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topProducts.map((tp) => {
                const live = findLiveProduct({ id: tp.productId, name: tp.name });
                const inCart = live
                  ? cart.find((c) => c.product.id === live.id)
                  : undefined;

                return (
                  <div
                    key={`${tp.productId}-${tp.name}`}
                    className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shrink-0">
                        <Image
                          src={
                            live?.images && live.images[0]
                              ? live.images[0]
                              : "/agenda_fondo_kamaluso.jpg"
                          }
                          alt={tp.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2">
                          {live?.name || tp.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Pediste {tp.totalQuantity} u. en {tp.orderCount}{" "}
                          {tp.orderCount === 1 ? "compra" : "compras"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Precio hoy
                        </span>
                        <span className="text-base font-black text-slate-900">
                          {live
                            ? `$${live.price.toLocaleString("es-UY")} UYU`
                            : "No disponible"}
                        </span>
                      </div>

                      {live && live.inStock ? (
                        inCart ? (
                          <div className="flex items-center border-2 border-pink-500 rounded-xl bg-pink-50 p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(live.id, inCart.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-pink-700 font-black hover:bg-pink-100 rounded-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 font-black text-xs text-slate-900">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(live.id, inCart.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center bg-pink-600 text-white font-black hover:bg-pink-700 rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(live, 1, false)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-pink-600 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          Sin stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIS DATOS Y ENVÍO */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Datos habituales para tu próximo Checkout
            </h2>
            <p className="text-xs text-slate-500">
              Cada vez que compres desde esta cuenta, todo esto se completará automáticamente.
            </p>
          </div>

          {profileErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSavedMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nombre completo o Empresa *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="099 123 456"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasRut}
                  onChange={(e) => setHasRut(e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                />
                <span className="font-bold text-slate-700">Facturación habitual con RUT</span>
              </label>

              {hasRut && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Número de RUT
                    </label>
                    <input
                      type="text"
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                      placeholder="211234560012"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Imprenta SRL"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-4 text-xs">
            <label className="block font-extrabold text-slate-800 uppercase tracking-wider">
              Modalidad de entrega habitual
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setDeliveryMode("agencia")}
                className={`py-2.5 px-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
                  deliveryMode === "agencia"
                    ? "bg-white text-pink-600 shadow-sm border-2 border-pink-500"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Retiro en Sucursal</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("domicilio")}
                className={`py-2.5 px-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
                  deliveryMode === "domicilio"
                    ? "bg-white text-pink-600 shadow-sm border-2 border-pink-500"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Envío a Domicilio</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("local")}
                className={`py-2.5 px-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
                  deliveryMode === "local"
                    ? "bg-white text-emerald-700 shadow-sm border-2 border-emerald-500"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Retiro en Taller</span>
              </button>
            </div>

            {deliveryMode !== "local" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Empresa de Encomienda
                  </label>
                  <select
                    value={shippingAgency}
                    onChange={(e) =>
                      setShippingAgency(e.target.value as "dac" | "correo" | "cotmi")
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white text-slate-900"
                  >
                    <option value="dac">DAC</option>
                    <option value="correo">Correo Uruguayo</option>
                    <option value="cotmi">Agencia COTMI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Departamento
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white text-slate-900"
                  >
                    {URUGUAY_DEPARTMENTS.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ciudad o Localidad
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {deliveryMode === "agencia"
                      ? `Sucursal de ${shippingAgency.toUpperCase()}`
                      : "Dirección (Calle, N° y Apto)"}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      deliveryMode === "agencia"
                        ? "Ej. Terminal Tres Cruces"
                        : "Ej. Av. 18 de Julio 1234"
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                  <span>Medio de Pago habitual</span>
                </label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white text-slate-900"
                >
                  {CUSTOMER_PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Indicaciones de entrega (Opcional)
                </label>
                <input
                  type="text"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ej. Casa de rejas negras, horario tarde..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md inline-flex items-center gap-2 transition cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar mis datos</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
