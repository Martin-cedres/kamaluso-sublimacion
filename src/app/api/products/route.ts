import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS } from "@/lib/products";
import { Product } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_PRODUCTS_FILENAME = "data/products.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "data/products.json" });
    if (blobs.length > 0) {
      // Intentar obtener el JSON guardado en Vercel Blob
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const products = await res.json();
        return NextResponse.json(products, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
      }
    }
  } catch (error) {
    console.warn("Vercel Blob token omitido en local. Obteniendo catálogo en vivo de Producción...");
    try {
      const prodRes = await fetch(`https://kamaluso-sublimacion.vercel.app/api/products?t=${Date.now()}`, { cache: "no-store" });
      if (!prodRes.ok) {
        // Fallback a dominio alternativo si aplica
        const altRes = await fetch(`https://kamaluso.vercel.app/api/products?t=${Date.now()}`, { cache: "no-store" });
        if (altRes.ok) {
          const altData = await altRes.json();
          if (Array.isArray(altData) && altData.length > 0) {
            return NextResponse.json(altData);
          }
        }
      } else {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          return NextResponse.json(prodData);
        }
      }
    } catch (fallbackErr) {
      console.warn("Error al sincronizar productos desde producción:", fallbackErr);
    }
  }

  return NextResponse.json(INITIAL_PRODUCTS, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
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
      } catch (e) {
        // En local intentar traer de producción para no pisar
        try {
          const prodRes = await fetch(`https://kamaluso-sublimacion.vercel.app/api/products?t=${Date.now()}`, { cache: "no-store" });
          if (prodRes.ok) {
            currentProducts = await prodRes.json();
          }
        } catch (err) {}
      }

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
