import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS } from "@/lib/products";
import { Product } from "@/types";

const BLOB_PRODUCTS_FILENAME = "data/products.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "data/products.json" });
    if (blobs.length > 0) {
      // Intentar obtener el JSON guardado en Vercel Blob
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const products = await res.json();
        return NextResponse.json(products);
      }
    }
  } catch (error) {
    console.warn("Vercel Blob products GET error, fallbacking to initial", error);
  }

  return NextResponse.json(INITIAL_PRODUCTS);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let updatedProducts: Product[] = [];

    if (Array.isArray(body)) {
      updatedProducts = body;
    } else if (body && body.id) {
      // Leer lista actual de Vercel Blob o inicial
      let currentProducts: Product[] = INITIAL_PRODUCTS;
      try {
        const { blobs } = await list({ prefix: "data/products.json" });
        if (blobs.length > 0) {
          const res = await fetch(blobs[0].url, { cache: "no-store" });
          if (res.ok) {
            currentProducts = await res.json();
          }
        }
      } catch (e) {}

      const idx = currentProducts.findIndex((p) => p.id === body.id);
      if (idx >= 0) {
        currentProducts[idx] = body;
      } else {
        currentProducts = [body, ...currentProducts];
      }
      updatedProducts = currentProducts;
    }

    // Guardar lista unificada en Vercel Blob Storage
    const blob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(updatedProducts, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, url: blob.url, products: updatedProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    let currentProducts: Product[] = INITIAL_PRODUCTS;
    try {
      const { blobs } = await list({ prefix: "data/products.json" });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          currentProducts = await res.json();
        }
      }
    } catch (e) {}

    const filtered = currentProducts.filter((p) => p.id !== id);

    await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(filtered, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, products: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
