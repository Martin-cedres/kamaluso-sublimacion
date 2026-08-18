import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Order } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_ORDERS_FILENAME = "data/orders.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "data/orders.json" });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const orders = await res.json();
        return NextResponse.json(orders, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
      }
    }
  } catch (error) {
    console.warn("Vercel Blob list omitido en local para pedidos.");
  }

  return NextResponse.json([], {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let updatedOrders: Order[] = [];

    if (Array.isArray(body)) {
      updatedOrders = body;
    } else if (body && body.id) {
      let currentOrders: Order[] = [];
      try {
        const { blobs } = await list({ prefix: "data/orders.json" });
        if (blobs.length > 0) {
          const res = await fetch(blobs[0].url, { cache: "no-store" });
          if (res.ok) {
            currentOrders = await res.json();
          }
        }
      } catch (e) {}

      const idx = currentOrders.findIndex((o) => o.id === body.id);
      if (idx >= 0) {
        currentOrders[idx] = body;
      } else {
        currentOrders = [body, ...currentOrders];
      }
      updatedOrders = currentOrders;
    }

    let blobUrl = "";
    try {
      const blob = await put(BLOB_ORDERS_FILENAME, JSON.stringify(updatedOrders, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      blobUrl = blob.url;
    } catch (blobErr: any) {
      console.warn("Vercel Blob put omitido en entorno local:", blobErr.message);
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

    let currentOrders: Order[] = [];
    try {
      const { blobs } = await list({ prefix: "data/orders.json" });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          currentOrders = await res.json();
        }
      }
    } catch (e) {}

    const filtered = currentOrders.filter((o) => o.id !== id);

    try {
      await put(BLOB_ORDERS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } catch (e) {}

    return NextResponse.json({ success: true, orders: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
