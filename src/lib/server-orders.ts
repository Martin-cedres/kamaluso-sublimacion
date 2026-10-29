import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { Order } from "@/types";

const BLOB_ORDERS_FILENAME = "data/orders.json";
const DIRECT_BLOB_ORDERS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/orders.json";
const LOCAL_ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

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
            orderMap.set(order.id, order);
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

            orderMap.set(order.id, {
              ...existing,
              ...order,
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

export async function getLatestServerOrders(): Promise<Order[]> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }
  const now = Date.now();

  if (cache.orders && cache.orders.length > 0 && now - cache.lastFetched < 5000) {
    return cache.orders;
  }

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

  let finalOrders: Order[] = [];

  if (blobOrders !== null) {
    // Fusionar blobOrders con cache.orders en memoria para que la caché CDN de Blob nunca borre un pedido recién creado
    finalOrders = mergeOrderLists(cache.deletedIds, blobOrders, cache.orders);
  } else if (cache.orders && cache.orders.length > 0) {
    finalOrders = mergeOrderLists(cache.deletedIds, cache.orders);
  } else {
    finalOrders = mergeOrderLists(cache.deletedIds, readLocalOrdersFile());
  }

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
  orderInput: Partial<Order> & { id: string }
): Promise<{ order: Order; orders: Order[]; blobUrl: string }> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  if (!cache.deletedIds) {
    cache.deletedIds = new Set<string>();
  }
  cache.deletedIds.delete(orderInput.id);

  const existingOrders = await getLatestServerOrders();
  const idx = existingOrders.findIndex((o) => o.id === orderInput.id);

  const deliveryType = orderInput.deliveryType || orderInput.customer?.deliveryType;

  let savedOrder: Order;
  let updatedOrders: Order[];

  if (idx >= 0) {
    const current = existingOrders[idx];
    const resolvedDeliveryType = deliveryType || current.deliveryType || current.customer?.deliveryType;
    savedOrder = {
      ...current,
      ...orderInput,
      deliveryType: resolvedDeliveryType,
      customer: {
        ...current.customer,
        ...(orderInput.customer || {}),
        deliveryType: resolvedDeliveryType,
      },
      items: orderInput.items && orderInput.items.length > 0 ? orderInput.items : current.items,
      mpPaymentId: orderInput.mpPaymentId || current.mpPaymentId,
      mpPayerEmail: orderInput.mpPayerEmail || current.mpPayerEmail,
      mpPayerName: orderInput.mpPayerName || current.mpPayerName,
      emailSent: Boolean(orderInput.emailSent || current.emailSent),
      emailSentAt: orderInput.emailSentAt || current.emailSentAt,
    };
    existingOrders[idx] = savedOrder;
    updatedOrders = [...existingOrders];
  } else {
    const observations =
      orderInput.observations ||
      orderInput.customer?.observations ||
      orderInput.notes ||
      orderInput.customer?.notes ||
      "";
    savedOrder = {
      id: orderInput.id,
      createdAt: orderInput.createdAt || new Date().toISOString(),
      customer: {
        name: orderInput.customer?.name || "Cliente",
        phone: orderInput.customer?.phone || "",
        email: orderInput.customer?.email || "",
        department: orderInput.customer?.department || "Montevideo",
        city: orderInput.customer?.city || "",
        address: orderInput.customer?.address || "",
        observations,
        notes: observations,
        deliveryType,
      },
      items: orderInput.items || [],
      totalPrice: Number(orderInput.totalPrice || 0),
      finalTotal: Number(orderInput.finalTotal || orderInput.totalPrice || 0),
      paymentMethodId: orderInput.paymentMethodId || "brou",
      paymentMethodName: orderInput.paymentMethodName || "Transferencia Bancaria BROU",
      shippingMethodName: orderInput.shippingMethodName || "DAC - Retiro en Agencia",
      status: orderInput.status || "pendiente",
      observations,
      notes: observations,
      deliveryType,
      mpPaymentId: orderInput.mpPaymentId,
      mpPayerEmail: orderInput.mpPayerEmail,
      mpPayerName: orderInput.mpPayerName,
      emailSent: Boolean(orderInput.emailSent),
      emailSentAt: orderInput.emailSentAt,
    };
    updatedOrders = [savedOrder, ...existingOrders];
  }

  const { blobUrl, orders } = await persistServerOrders(updatedOrders);
  return { order: savedOrder, orders, blobUrl };
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
  const { orders } = await persistServerOrders(filtered);
  return orders;
}
