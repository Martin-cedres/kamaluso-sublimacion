import { Order, OrderStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const LOCAL_ORDERS_KEY = "kamaluso_orders";

function getLocalStoredOrders(): Order[] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Order[]) : null;
  } catch (e) {
    return null;
  }
}

function saveLocalStoredOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  const current = getLocalStoredOrders() || [];
  const merged = mergeOrdersWithLocal(orders, current);
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(merged));
}

function removeLocalStoredOrder(id: string): void {
  if (typeof window === "undefined") return;
  const current = getLocalStoredOrders() || [];
  const filtered = current.filter((o) => o.id !== id);
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(filtered));
}

function mergeOrdersWithLocal(remoteOrders: Order[], localOrders: Order[] | null): Order[] {
  const orderMap = new Map<string, Order>();

  if (Array.isArray(localOrders)) {
    localOrders.forEach((lo) => {
      if (lo && lo.id) orderMap.set(lo.id, lo);
    });
  }

  if (Array.isArray(remoteOrders)) {
    remoteOrders.forEach((ro) => {
      if (ro && ro.id) {
        const existing = orderMap.get(ro.id);
        if (!existing) {
          orderMap.set(ro.id, ro);
        } else {
          orderMap.set(ro.id, {
            ...existing,
            ...ro,
            customer: {
              ...existing.customer,
              ...ro.customer,
            },
            items: ro.items && ro.items.length > 0 ? ro.items : existing.items,
          });
        }
      }
    });
  }

  return Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function getAllOrders(): Promise<Order[]> {
  const localStored = getLocalStoredOrders() || [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const merged = mergeOrdersWithLocal(data as Order[], localStored);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (e) {
      console.warn("Supabase orders fetch error, fallbacking", e);
    }
  }

  try {
    const res = await fetch("/api/orders?t=" + Date.now(), { cache: "no-store" });
    if (res.ok) {
      const cloudOrders = await res.json();
      if (Array.isArray(cloudOrders)) {
        const merged = mergeOrdersWithLocal(cloudOrders, localStored);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(merged));
        }

        // Si local tenía pedidos que el servidor no tiene (ej. creados en modo local o antes de sync), sincronizarlos
        if (merged.length > cloudOrders.length) {
          fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(merged),
          }).catch(() => {});
        }

        return merged;
      }
    }
  } catch (e) {
    console.warn("Error al obtener pedidos de la API", e);
  }

  return localStored;
}

export async function saveOrder(orderData: Partial<Order>): Promise<Order> {
  const id = orderData.id || `KAM-${Date.now().toString().slice(-6)}`;
  const createdAt = orderData.createdAt || new Date().toISOString();

  const observations =
    orderData.observations ||
    orderData.customer?.observations ||
    orderData.notes ||
    orderData.customer?.notes ||
    "";

  const fullOrder: Order = {
    id,
    createdAt,
    customer: {
      name: orderData.customer?.name || "Cliente",
      phone: orderData.customer?.phone || "",
      email: orderData.customer?.email || "",
      department: orderData.customer?.department || "Montevideo",
      city: orderData.customer?.city || "",
      address: orderData.customer?.address || "",
      observations,
      notes: observations,
    },
    items: orderData.items || [],
    totalPrice: orderData.totalPrice || 0,
    finalTotal: orderData.finalTotal || orderData.totalPrice || 0,
    paymentMethodId: orderData.paymentMethodId || "brou",
    paymentMethodName: orderData.paymentMethodName || "Transferencia Bancaria BROU",
    shippingMethodName: orderData.shippingMethodName || "Agencia COTMI - Retiro en Agencia",
    status: orderData.status || "pendiente",
    observations,
    notes: observations,
  };

  // 1. Guardar localmente de inmediato (optimista y no destructivo)
  let localOrders = getLocalStoredOrders() || [];
  const idx = localOrders.findIndex((o) => o.id === fullOrder.id);
  if (idx >= 0) {
    localOrders[idx] = fullOrder;
  } else {
    localOrders = [fullOrder, ...localOrders];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(localOrders));
  }

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

  // 3. API Cloud / Local backend
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
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(localOrders));
    }

    // Re-guardar mediante saveOrder para sincronizar con la nube y el backend
    await saveOrder(localOrders[idx]);
  }
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  removeLocalStoredOrder(id);

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
