import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

const BLOB_ORDERS_FILENAME = "data/orders.json";

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
    blobUrl: null,
    lastFetched: 0,
  };
}

export async function GET() {
  const cache = globalThis.__kamaluso_orders_cache__!;
  const now = Date.now();

  // 1. Devolver de memoria si existe (0ms, 0 requests)
  if (cache.orders.length > 0 && now - cache.lastFetched < 30000) {
    return NextResponse.json(cache.orders, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // 2. Fetch directo por URL si existe
  if (cache.blobUrl) {
    try {
      const res = await fetch(cache.blobUrl, { cache: "no-store" });
      if (res.ok) {
        const orders = await res.json();
        if (Array.isArray(orders)) {
          cache.orders = orders;
          cache.lastFetched = now;
          return NextResponse.json(orders);
        }
      }
    } catch (e) {}
  }

  // 3. Fallback inicial único con list()
  if (!cache.blobUrl) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "data/orders.json" });
      if (blobs.length > 0) {
        cache.blobUrl = blobs[0].url;
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          const orders = await res.json();
          cache.orders = orders;
          cache.lastFetched = now;
          return NextResponse.json(orders);
        }
      }
    } catch (error) {}
  }

  return NextResponse.json(cache.orders || [], {
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
      updatedOrders = body;
    } else if (body && body.id) {
      let currentOrders: Order[] = cache.orders || [];
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
    const currentOrders: Order[] = cache.orders || [];
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
