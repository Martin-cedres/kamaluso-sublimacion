import { Order, OrderStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const LOCAL_ORDERS_KEY = "kamaluso_orders";

function getLocalStoredOrders(): Order[] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Order[];
  } catch (e) {
    return null;
  }
}

function saveLocalStoredOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

function mergeOrdersWithLocal(remoteOrders: Order[], localOrders: Order[] | null): Order[] {
  if (!localOrders || localOrders.length === 0) return remoteOrders;

  const orderMap = new Map<string, Order>();
  remoteOrders.forEach((o) => orderMap.set(o.id, o));
  localOrders.forEach((lo) => orderMap.set(lo.id, lo));

  const merged = Array.from(orderMap.values());
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllOrders(): Promise<Order[]> {
  const localStored = getLocalStoredOrders();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return mergeOrdersWithLocal(data as Order[], localStored);
      }
    } catch (e) {
      console.warn("Supabase orders fetch error, fallbacking", e);
    }
  }

  try {
    const res = await fetch("/api/orders?t=" + Date.now(), { cache: "no-store" });
    if (res.ok) {
      const cloudOrders = await res.json();
      if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
        return mergeOrdersWithLocal(cloudOrders, localStored);
      }
    }
  } catch (e) {
    console.warn("Error al obtener pedidos de la API", e);
  }

  return localStored || [];
}

export async function saveOrder(orderData: Partial<Order>): Promise<Order> {
  const id = orderData.id || `KAM-${Date.now().toString().slice(-6)}`;
  const createdAt = orderData.createdAt || new Date().toISOString();

  const fullOrder: Order = {
    id,
    createdAt,
    customer: orderData.customer || {
      name: "Cliente",
      phone: "",
      email: "",
      department: "Montevideo",
      city: "",
      address: "",
    },
    items: orderData.items || [],
    totalPrice: orderData.totalPrice || 0,
    finalTotal: orderData.finalTotal || orderData.totalPrice || 0,
    paymentMethodId: orderData.paymentMethodId || "brou",
    paymentMethodName: orderData.paymentMethodName || "Transferencia Bancaria BROU",
    shippingMethodName: orderData.shippingMethodName || "Envío a Domicilio",
    status: orderData.status || "pendiente",
  };

  // 1. Guardar localmente
  let localOrders = getLocalStoredOrders() || [];
  const idx = localOrders.findIndex((o) => o.id === fullOrder.id);
  if (idx >= 0) {
    localOrders[idx] = fullOrder;
  } else {
    localOrders = [fullOrder, ...localOrders];
  }
  saveLocalStoredOrders(localOrders);

  // 2. Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("orders").upsert({
        id: fullOrder.id,
        created_at: fullOrder.createdAt,
        customer_name: fullOrder.customer.name,
        customer_phone: fullOrder.customer.phone,
        customer_email: fullOrder.customer.email,
        customer_department: fullOrder.customer.department,
        customer_city: fullOrder.customer.city,
        customer_address: fullOrder.customer.address,
        items: fullOrder.items,
        total_price: fullOrder.totalPrice,
        final_total: fullOrder.finalTotal,
        payment_method_name: fullOrder.paymentMethodName,
        shipping_method_name: fullOrder.shippingMethodName,
        status: fullOrder.status,
      });
    } catch (e) {
      console.error("Error al guardar pedido en Supabase", e);
    }
  }

  // 3. API Vercel Blob
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullOrder),
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.orders && Array.isArray(resData.orders)) {
        saveLocalStoredOrders(resData.orders);
      }
    }
  } catch (e) {
    console.error("Error al guardar pedido en API cloud", e);
  }

  return fullOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  let localOrders = getLocalStoredOrders() || [];
  const idx = localOrders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    localOrders[idx].status = status;
    saveLocalStoredOrders(localOrders);

    // Re-guardar mediante saveOrder para sincronizar con la nube
    await saveOrder(localOrders[idx]);
  }
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  let localOrders = getLocalStoredOrders() || [];
  localOrders = localOrders.filter((o) => o.id !== id);
  saveLocalStoredOrders(localOrders);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("orders").delete().eq("id", id);
    } catch (e) {}
  }

  try {
    await fetch(`/api/orders?id=${id}`, {
      method: "DELETE",
    });
  } catch (e) {}

  return true;
}
