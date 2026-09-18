import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

const BLOB_ORDERS_FILENAME = "data/orders.json";
const DIRECT_BLOB_ORDERS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/orders.json";

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

async function getLatestOrdersFromBlob(): Promise<Order[]> {
  const cache = globalThis.__kamaluso_orders_cache__!;
  const now = Date.now();

  // Si tenemos memoria reciente de menos de 10s, la usamos
  if (cache.orders && cache.orders.length > 0 && now - cache.lastFetched < 10000) {
    return cache.orders;
  }

  // De lo contrario, forzar lectura fresca de la CDN de Vercel Blob
  const targetUrl = cache.blobUrl || DIRECT_BLOB_ORDERS_URL;
  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    if (res.ok) {
      const orders = await res.json();
      if (Array.isArray(orders)) {
        cache.orders = orders;
        cache.blobUrl = targetUrl;
        cache.lastFetched = now;
        return orders;
      }
    }
  } catch (e) {
    console.warn("Error leyendo pedidos de Vercel Blob CDN:", e);
  }

  return cache.orders || [];
}

export async function GET() {
  const orders = await getLatestOrdersFromBlob();
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
    
    // Cargar SIEMPRE los pedidos existentes antes de agregar o actualizar
    let currentOrders = await getLatestOrdersFromBlob();
    let updatedOrders: Order[] = [];

    if (Array.isArray(body)) {
      const orderMap = new Map<string, Order>();
      currentOrders.forEach((o) => orderMap.set(o.id, o));
      body.forEach((o) => orderMap.set(o.id, o));
      updatedOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (body && body.id) {
      const idx = currentOrders.findIndex((o) => o.id === body.id);
      if (idx >= 0) {
        currentOrders[idx] = body;
      } else {
        currentOrders = [body, ...currentOrders];
      }
      updatedOrders = currentOrders;
    }

    cache.orders = updatedOrders;
    cache.lastFetched = Date.now();

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
      console.warn("Vercel Blob put en pedidos:", blobErr.message);
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
    let currentOrders = await getLatestOrdersFromBlob();
    const filtered = currentOrders.filter((o) => o.id !== id);

    cache.orders = filtered;
    cache.lastFetched = Date.now();

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
