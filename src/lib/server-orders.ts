import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { Order, resolveOrderShippingCost } from "@/types";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";

const BLOB_ORDERS_FILENAME = "data/orders.json";
const DIRECT_BLOB_ORDERS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/orders.json";
const LOCAL_ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

interface SupabaseOrderRow {
  id: string;
  created_at: string;
  customer_id: string | null;
  customer: Order["customer"];
  items: Order["items"];
  total_price: number;
  final_total: number;
  payment_method_id: string | null;
  payment_method_name: string | null;
  shipping_method_name: string | null;
  shipping_cost: number | null;
  status: Order["status"];
  notes: string | null;
  observations: string | null;
  delivery_type: Order["deliveryType"] | null;
  mp_payment_id: string | null;
  mp_payer_email: string | null;
  mp_payer_name: string | null;
  email_sent: boolean | null;
  email_sent_at: string | null;
}

export function orderToSupabaseRow(order: Order): SupabaseOrderRow {
  return {
    id: order.id,
    created_at: order.createdAt || new Date().toISOString(),
    customer_id: order.customerId || null,
    customer: order.customer,
    items: Array.isArray(order.items) ? order.items : [],
    total_price: Number(order.totalPrice || 0),
    final_total: Number(order.finalTotal || order.totalPrice || 0),
    payment_method_id: order.paymentMethodId || "brou",
    payment_method_name: order.paymentMethodName || "",
    shipping_method_name: order.shippingMethodName || "",
    shipping_cost: resolveOrderShippingCost(order),
    status: order.status || "pendiente",
    notes: order.notes || order.observations || null,
    observations: order.observations || order.customer?.observations || null,
    delivery_type: order.deliveryType || order.customer?.deliveryType || null,
    mp_payment_id: order.mpPaymentId || null,
    mp_payer_email: order.mpPayerEmail || null,
    mp_payer_name: order.mpPayerName || null,
    email_sent: Boolean(order.emailSent),
    email_sent_at: order.emailSentAt || null,
  };
}

export function supabaseRowToOrder(row: SupabaseOrderRow): Order {
  const shippingMethodName = row.shipping_method_name || "DAC - Retiro en Agencia";
  const deliveryType = row.delivery_type || row.customer?.deliveryType || undefined;
  const observations = row.observations || row.notes || row.customer?.observations || "";
  const shippingCost = resolveOrderShippingCost({
    shippingCost: typeof row.shipping_cost === "number" ? Number(row.shipping_cost) : undefined,
    shippingMethodName,
    deliveryType,
  });

  return {
    id: row.id,
    createdAt: row.created_at,
    customerId: row.customer_id || undefined,
    customer: {
      name: row.customer?.name || "Cliente",
      phone: row.customer?.phone || "",
      email: row.customer?.email || "",
      department: row.customer?.department || "Montevideo",
      city: row.customer?.city || "",
      address: row.customer?.address || "",
      observations,
      notes: observations,
      deliveryType,
    },
    items: Array.isArray(row.items) ? row.items : [],
    totalPrice: Number(row.total_price || 0),
    finalTotal: Number(row.final_total || row.total_price || 0),
    paymentMethodId: row.payment_method_id || "brou",
    paymentMethodName: row.payment_method_name || "Transferencia Bancaria BROU",
    shippingMethodName,
    shippingCost,
    status: row.status || "pendiente",
    notes: observations || undefined,
    observations: observations || undefined,
    deliveryType,
    mpPaymentId: row.mp_payment_id || undefined,
    mpPayerEmail: row.mp_payer_email || undefined,
    mpPayerName: row.mp_payer_name || undefined,
    emailSent: Boolean(row.email_sent),
    emailSentAt: row.email_sent_at || undefined,
  };
}

declare global {
  var __kamaluso_orders_cache__: {
    orders: Order[];
    deletedIds: Set<string>;
    blobUrl: string | null;
    lastFetched: number;
  } | undefined;
}

if (!globalThis.__kamaluso_orders_cache__) {
  globalThis.__kamaluso_orders_cache__ = {
    orders: [],
    deletedIds: new Set<string>(),
    blobUrl: DIRECT_BLOB_ORDERS_URL,
    lastFetched: 0,
  };
}

function readLocalOrdersFile(): Order[] {
  try {
    if (fs.existsSync(LOCAL_ORDERS_PATH)) {
      const content = fs.readFileSync(LOCAL_ORDERS_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Server Orders] Error leyendo archivo local data/orders.json:", err);
  }
  return [];
}

function writeLocalOrdersFile(orders: Order[]): void {
  try {
    const dir = path.dirname(LOCAL_ORDERS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
  } catch {
    // Normal en entornos serverless con sistema de archivos de solo lectura
  }
}

export function mergeOrderLists(
  deletedIds: Set<string>,
  ...lists: (Order[] | undefined | null)[]
): Order[] {
  const orderMap = new Map<string, Order>();

  for (const list of lists) {
    if (Array.isArray(list)) {
      for (const order of list) {
        if (order && order.id && !deletedIds.has(order.id)) {
          const existing = orderMap.get(order.id);
          if (!existing) {
            orderMap.set(order.id, {
              ...order,
              shippingCost: resolveOrderShippingCost(order),
            });
          } else {
            // Priorizar estado más avanzado o datos enriquecidos (ej. pago_confirmado sobre pendiente)
            const statusPriority: Record<string, number> = {
              pendiente: 1,
              pago_confirmado: 2,
              en_preparacion: 3,
              despachado: 4,
              cancelado: 5,
            };
            const existingPrio = statusPriority[existing.status] || 0;
            const incomingPrio = statusPriority[order.status] || 0;
            const resolvedStatus = incomingPrio >= existingPrio ? order.status : existing.status;

            const resolvedDeliveryType =
              order.deliveryType ||
              existing.deliveryType ||
              order.customer?.deliveryType ||
              existing.customer?.deliveryType;

            const resolvedShippingCost = resolveOrderShippingCost({
              shippingCost: typeof order.shippingCost === "number" ? order.shippingCost : existing.shippingCost,
              shippingMethodName: order.shippingMethodName || existing.shippingMethodName,
              deliveryType: resolvedDeliveryType,
            });

            orderMap.set(order.id, {
              ...existing,
              ...order,
              shippingCost: resolvedShippingCost,
              deliveryType: resolvedDeliveryType,
              status: resolvedStatus,
              customer: {
                ...existing.customer,
                ...order.customer,
                deliveryType: resolvedDeliveryType,
              },
              items: order.items && order.items.length > 0 ? order.items : existing.items,
              mpPaymentId: order.mpPaymentId || existing.mpPaymentId,
              mpPayerEmail: order.mpPayerEmail || existing.mpPayerEmail,
              mpPayerName: order.mpPayerName || existing.mpPayerName,
              emailSent: Boolean(order.emailSent || existing.emailSent),
              emailSentAt: order.emailSentAt || existing.emailSentAt,
            });
          }
        }
      }
    }
  }

  return Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function getBlobOnlyOrders(): Promise<Order[]> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }
  const now = Date.now();

  let blobOrders: Order[] | null = null;
  const targetUrl = `${cache.blobUrl || DIRECT_BLOB_ORDERS_URL}?t=${now}`;
  try {
    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        blobOrders = data;
      }
    }
  } catch (e) {
    console.warn("[Server Orders] Aviso al leer de Vercel Blob:", e);
  }

  if (blobOrders !== null) {
    return mergeOrderLists(cache.deletedIds, blobOrders, cache.orders);
  }
  if (cache.orders && cache.orders.length > 0) {
    return mergeOrderLists(cache.deletedIds, cache.orders);
  }
  return mergeOrderLists(cache.deletedIds, readLocalOrdersFile());
}

export async function getLatestServerOrders(): Promise<Order[]> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }
  const now = Date.now();

  if (cache.orders && cache.orders.length > 0 && now - cache.lastFetched < 5000) {
    return cache.orders;
  }

  if (isServerSupabaseConfigured) {
    try {
      const client = getServerSupabase();
      if (client) {
        const { data, error } = await client
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = (data as SupabaseOrderRow[])
            .map(supabaseRowToOrder)
            .filter((o) => !cache.deletedIds.has(o.id));
          cache.orders = mapped;
          cache.lastFetched = now;
          writeLocalOrdersFile(mapped);
          return mapped;
        }
      }
    } catch (supaErr) {
      console.warn("[Server Orders] Fallback a Blob tras aviso en Supabase:", supaErr);
    }
  }

  const finalOrders = await getBlobOnlyOrders();

  cache.orders = finalOrders;
  cache.lastFetched = now;

  writeLocalOrdersFile(finalOrders);

  return finalOrders;
}

export async function persistServerOrders(orders: Order[]): Promise<{ blobUrl: string; orders: Order[] }> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }

  const cleanOrders = orders.filter((o) => o && o.id && !cache.deletedIds.has(o.id));
  cache.orders = cleanOrders;
  cache.lastFetched = Date.now();

  writeLocalOrdersFile(cleanOrders);

  if (isServerSupabaseConfigured && cleanOrders.length > 0) {
    try {
      const client = getServerSupabase();
      if (client) {
        await client
          .from("orders")
          .upsert(cleanOrders.map(orderToSupabaseRow), { onConflict: "id" });
      }
    } catch (supaErr) {
      console.warn("[Server Orders] Aviso al sincronizar lote en Supabase:", supaErr);
    }
  }

  let blobUrl = cache.blobUrl || DIRECT_BLOB_ORDERS_URL;
  try {
    const blob = await put(BLOB_ORDERS_FILENAME, JSON.stringify(cleanOrders, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json",
    });
    blobUrl = blob.url;
    cache.blobUrl = blobUrl;
  } catch (blobErr) {
    console.warn("[Server Orders] Aviso al guardar en Vercel Blob:", blobErr);
  }

  return { blobUrl, orders: cleanOrders };
}

export async function upsertServerOrder(
  orderInput: Partial<Order> & { id: string; skipCustomerSync?: boolean }
): Promise<{ order: Order; orders: Order[]; blobUrl: string; isNew: boolean }> {
  const { skipCustomerSync: _ignoredSkipSync, ...cleanOrderInput } = orderInput;
  void _ignoredSkipSync;

  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }
  cache.deletedIds.delete(cleanOrderInput.id);

  const existingOrders = await getLatestServerOrders();
  const idx = existingOrders.findIndex((o) => o.id === cleanOrderInput.id);
  const isNew = idx === -1;

  const deliveryType = cleanOrderInput.deliveryType || cleanOrderInput.customer?.deliveryType;

  let savedOrder: Order;
  let updatedOrders: Order[];

  if (idx >= 0) {
    const current = existingOrders[idx];
    const resolvedDeliveryType = deliveryType || current.deliveryType || current.customer?.deliveryType;
    const resolvedShippingCost = resolveOrderShippingCost({
      shippingCost: typeof cleanOrderInput.shippingCost === "number" ? cleanOrderInput.shippingCost : current.shippingCost,
      shippingMethodName: cleanOrderInput.shippingMethodName || current.shippingMethodName,
      deliveryType: resolvedDeliveryType,
    });
    const resolvedObservations =
      cleanOrderInput.observations !== undefined
        ? cleanOrderInput.observations
        : cleanOrderInput.customer?.observations !== undefined
        ? cleanOrderInput.customer.observations
        : current.observations || current.customer?.observations || "";

    savedOrder = {
      ...current,
      ...cleanOrderInput,
      customerId: cleanOrderInput.customerId || current.customerId,
      shippingCost: resolvedShippingCost,
      deliveryType: resolvedDeliveryType,
      observations: resolvedObservations,
      notes: resolvedObservations,
      customer: {
        ...current.customer,
        ...(cleanOrderInput.customer || {}),
        observations: resolvedObservations,
        notes: resolvedObservations,
        deliveryType: resolvedDeliveryType,
      },
      items: Array.isArray(cleanOrderInput.items) ? cleanOrderInput.items : current.items,
      mpPaymentId: cleanOrderInput.mpPaymentId || current.mpPaymentId,
      mpPayerEmail: cleanOrderInput.mpPayerEmail || current.mpPayerEmail,
      mpPayerName: cleanOrderInput.mpPayerName || current.mpPayerName,
      emailSent: Boolean(cleanOrderInput.emailSent || current.emailSent),
      emailSentAt: cleanOrderInput.emailSentAt || current.emailSentAt,
    };
    existingOrders[idx] = savedOrder;
    updatedOrders = [...existingOrders];
  } else {
    const observations =
      cleanOrderInput.observations ||
      cleanOrderInput.customer?.observations ||
      cleanOrderInput.notes ||
      cleanOrderInput.customer?.notes ||
      "";
    const resolvedShippingCost = resolveOrderShippingCost({
      shippingCost: cleanOrderInput.shippingCost,
      shippingMethodName: cleanOrderInput.shippingMethodName,
      deliveryType,
    });
    savedOrder = {
      id: cleanOrderInput.id,
      createdAt: cleanOrderInput.createdAt || new Date().toISOString(),
      customerId: cleanOrderInput.customerId,
      customer: {
        name: cleanOrderInput.customer?.name || "Cliente",
        phone: cleanOrderInput.customer?.phone || "",
        email: cleanOrderInput.customer?.email || "",
        department: cleanOrderInput.customer?.department || "Montevideo",
        city: cleanOrderInput.customer?.city || "",
        address: cleanOrderInput.customer?.address || "",
        observations,
        notes: observations,
        deliveryType,
      },
      items: cleanOrderInput.items || [],
      totalPrice: Number(cleanOrderInput.totalPrice || 0),
      finalTotal: Number(cleanOrderInput.finalTotal || cleanOrderInput.totalPrice || 0),
      paymentMethodId: cleanOrderInput.paymentMethodId || "brou",
      paymentMethodName: cleanOrderInput.paymentMethodName || "Transferencia Bancaria BROU",
      shippingMethodName: cleanOrderInput.shippingMethodName || "DAC - Retiro en Agencia",
      shippingCost: resolvedShippingCost,
      status: cleanOrderInput.status || "pendiente",
      observations,
      notes: observations,
      deliveryType,
      mpPaymentId: cleanOrderInput.mpPaymentId,
      mpPayerEmail: cleanOrderInput.mpPayerEmail,
      mpPayerName: cleanOrderInput.mpPayerName,
      emailSent: Boolean(cleanOrderInput.emailSent),
      emailSentAt: cleanOrderInput.emailSentAt,
    };
    updatedOrders = [savedOrder, ...existingOrders];
  }

  if (isServerSupabaseConfigured) {
    try {
      const client = getServerSupabase();
      if (client) {
        const { error } = await client
          .from("orders")
          .upsert(orderToSupabaseRow(savedOrder), { onConflict: "id" });
        if (!error) {
          cache.orders = updatedOrders;
          cache.lastFetched = Date.now();
          writeLocalOrdersFile(updatedOrders);
          return {
            order: savedOrder,
            orders: updatedOrders,
            blobUrl: cache.blobUrl || DIRECT_BLOB_ORDERS_URL,
            isNew,
          };
        }
      }
    } catch (supaErr) {
      console.warn("[Server Orders] Fallback a Blob en upsertServerOrder:", supaErr);
    }
  }

  const { blobUrl, orders } = await persistServerOrders(updatedOrders);
  return { order: savedOrder, orders, blobUrl, isNew };
}

export const saveServerOrder = upsertServerOrder;

export async function deleteServerOrder(id: string): Promise<Order[]> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }
  cache.deletedIds.add(id);

  const existingOrders = await getLatestServerOrders();
  const filtered = existingOrders.filter((o) => o.id !== id);

  if (isServerSupabaseConfigured) {
    try {
      const client = getServerSupabase();
      if (client) {
        const { error } = await client.from("orders").delete().eq("id", id);
        if (!error) {
          cache.orders = filtered;
          cache.lastFetched = Date.now();
          writeLocalOrdersFile(filtered);
          return filtered;
        }
      }
    } catch (supaErr) {
      console.warn("[Server Orders] Fallback a Blob en deleteServerOrder:", supaErr);
    }
  }

  const { orders } = await persistServerOrders(filtered);
  return orders;
}
