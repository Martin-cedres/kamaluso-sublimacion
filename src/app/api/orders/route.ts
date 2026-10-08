import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

const BLOB_ORDERS_FILENAME = "data/orders.json";
const DIRECT_BLOB_ORDERS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/orders.json";
const LOCAL_ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

declare global {
  var __kamaluso_orders_cache__: {
    orders: Order[];
    blobUrl: string | null;
    lastFetched: number;
  } | undefined;
}

if (!globalThis.__kamaluso_orders_cache__) {
  globalThis.__kamaluso_orders_cache__ = {
    orders: [],
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
    console.warn("[API Orders] Error leyendo archivo local data/orders.json:", err);
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
  } catch (err) {
    // Normal en entornos serverless con sistema de archivos de solo lectura
  }
}

function mergeOrderLists(...lists: (Order[] | undefined | null)[]): Order[] {
  const orderMap = new Map<string, Order>();

  for (const list of lists) {
    if (Array.isArray(list)) {
      for (const order of list) {
        if (order && order.id) {
          const existing = orderMap.get(order.id);
          if (!existing) {
            orderMap.set(order.id, order);
          } else {
            // Mantener la versión con fecha o datos más recientes
            orderMap.set(order.id, {
              ...existing,
              ...order,
              customer: {
                ...existing.customer,
                ...order.customer,
              },
              items: order.items && order.items.length > 0 ? order.items : existing.items,
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

async function getLatestOrders(): Promise<Order[]> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  const now = Date.now();

  // Si la memoria es reciente (< 10s), devolver memoria
  if (cache.orders && cache.orders.length > 0 && now - cache.lastFetched < 10000) {
    return cache.orders;
  }

  // Consultar Vercel Blob con cache busting
  let blobOrders: Order[] | null = null;
  const targetUrl = (cache.blobUrl || DIRECT_BLOB_ORDERS_URL) + `?t=${now}`;
  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        blobOrders = data;
      }
    }
  } catch (e) {
    console.warn("[API Orders] Aviso al leer de Vercel Blob:", e);
  }

  let finalOrders: Order[] = [];

  if (blobOrders !== null) {
    // Si Blob respondió, Blob es la única fuente de verdad en producción
    finalOrders = blobOrders;
  } else if (cache.orders && cache.orders.length > 0) {
    finalOrders = cache.orders;
  } else {
    // Solo como fallback de arranque en frío si Blob falló y la memoria está vacía
    finalOrders = readLocalOrdersFile();
  }

  cache.orders = finalOrders;
  cache.lastFetched = now;

  // Persistir en disco local
  writeLocalOrdersFile(finalOrders);

  return finalOrders;
}

export async function GET() {
  const orders = await getLatestOrders();
  return NextResponse.json(orders, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cache = globalThis.__kamaluso_orders_cache__!;
    let updatedOrders: Order[] = [];

    if (Array.isArray(body)) {
      // Reemplazo total explícito (útil para sincronizaciones y depuración)
      updatedOrders = body;
    } else if (body && body.id) {
      const existingOrders = await getLatestOrders();
      const idx = existingOrders.findIndex((o) => o.id === body.id);
      if (idx >= 0) {
        existingOrders[idx] = {
          ...existingOrders[idx],
          ...body,
          customer: {
            ...existingOrders[idx].customer,
            ...body.customer,
          },
          items: body.items && body.items.length > 0 ? body.items : existingOrders[idx].items,
        };
        updatedOrders = existingOrders;
      } else {
        updatedOrders = [body, ...existingOrders];
      }
    }

    cache.orders = updatedOrders;
    cache.lastFetched = Date.now();

    // Guardar en disco local
    writeLocalOrdersFile(updatedOrders);

    // Guardar en Vercel Blob
    let blobUrl = cache.blobUrl || "";
    try {
      const blob = await put(BLOB_ORDERS_FILENAME, JSON.stringify(updatedOrders, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      blobUrl = blob.url;
      cache.blobUrl = blobUrl;
    } catch (blobErr: any) {
      console.warn("Aviso al guardar en Vercel Blob:", blobErr);
    }

    return NextResponse.json({ success: true, url: blobUrl, orders: updatedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const cache = globalThis.__kamaluso_orders_cache__!;
    const existingOrders = await getLatestOrders();
    const filtered = existingOrders.filter((o) => o.id !== id);

    cache.orders = filtered;
    cache.lastFetched = Date.now();

    writeLocalOrdersFile(filtered);

    let blobUrl = cache.blobUrl || "";
    try {
      const blob = await put(BLOB_ORDERS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      blobUrl = blob.url;
      cache.blobUrl = blobUrl;
    } catch (e) {
      console.warn("Aviso al actualizar Vercel Blob tras DELETE:", e);
    }

    return NextResponse.json({ success: true, orders: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
