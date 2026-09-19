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

  const fileOrders = readLocalOrdersFile();

  // Si la memoria es muy reciente (< 5s), devolver fusión rápida de memoria y disco
  if (cache.orders && cache.orders.length > 0 && now - cache.lastFetched < 5000) {
    const fastMerged = mergeOrderLists(cache.orders, fileOrders);
    cache.orders = fastMerged;
    return fastMerged;
  }

  // Consultar Vercel Blob con cache busting
  let blobOrders: Order[] = [];
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

  // Fusionar de forma segura: Memoria + Archivo en disco + Vercel Blob (NUNCA se pierden pedidos)
  const mergedOrders = mergeOrderLists(cache.orders, fileOrders, blobOrders);

  cache.orders = mergedOrders;
  cache.lastFetched = now;

  // Persistir en disco local
  writeLocalOrdersFile(mergedOrders);

  return mergedOrders;
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

    // Cargar todos los pedidos conocidos hasta el momento
    const existingOrders = await getLatestOrders();

    let incomingOrders: Order[] = [];
    if (Array.isArray(body)) {
      incomingOrders = body;
    } else if (body && body.id) {
      incomingOrders = [body];
    }

    const updatedOrders = mergeOrderLists(existingOrders, incomingOrders);

    cache.orders = updatedOrders;
    cache.lastFetched = Date.now();

    // Guardar en disco local
    writeLocalOrdersFile(updatedOrders);

    // Intentar guardar en Vercel Blob si está configurado
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
      // Ignorar si no hay token de Vercel Blob en local
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

    try {
      const blob = await put(BLOB_ORDERS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      cache.blobUrl = blob.url;
    } catch (e) {}

    return NextResponse.json({ success: true, orders: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
