import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

const BLOB_PRODUCTS_FILENAME = "data/products.json";

// Declaración de variables globales en Node para caché en memoria sin llamadas a list()
declare global {
  var __kamaluso_products_cache__: {
    products: Product[];
    blobUrl: string | null;
    lastFetched: number;
  } | undefined;
}

if (!globalThis.__kamaluso_products_cache__) {
  globalThis.__kamaluso_products_cache__ = {
    products: [],
    blobUrl: null,
    lastFetched: 0,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldReset = searchParams.get("reset") === "true";
    const cache = globalThis.__kamaluso_products_cache__!;

    if (shouldReset) {
      cache.products = [];
      try {
        const newBlob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify([], null, 2), {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
        });
        cache.blobUrl = newBlob.url;
      } catch (e) {}
      return NextResponse.json([], {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }

    // 1. Si tenemos productos en memoria del servidor y fueron actualizados hace menos de 60s, devolver al instante (0ms, 0 requests)
    const now = Date.now();
    if (cache.products.length > 0 && now - cache.lastFetched < 60000) {
      return NextResponse.json(cache.products, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    // 2. Si conocemos la URL directa del blob, hacer un simple fetch (Simple Request CDN, 0 Advanced Requests)
    if (cache.blobUrl) {
      try {
        const res = await fetch(cache.blobUrl, { next: { revalidate: 60, tags: ["products"] } });
        if (res.ok) {
          const cloudProducts = await res.json();
          if (Array.isArray(cloudProducts)) {
            cache.products = cloudProducts;
            cache.lastFetched = now;
            return NextResponse.json(cloudProducts, {
              headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
              },
            });
          }
        }
      } catch (fetchErr) {
        console.warn("Fetch directo a blob URL falló, usando memoria:", fetchErr);
      }
    }

    // 3. Fallback inicial único: Si no hay URL memorizada, buscarla una sola vez con list() y guardarla para siempre en cache
    if (!cache.blobUrl) {
      try {
        const { list } = await import("@vercel/blob");
        const { blobs } = await list({ prefix: "data/products.json" });
        if (blobs.length > 0) {
          const latestBlob = blobs[blobs.length - 1];
          cache.blobUrl = latestBlob.url;
          const res = await fetch(latestBlob.url, { cache: "no-store" });
          if (res.ok) {
            const cloudProducts = await res.json();
            if (Array.isArray(cloudProducts)) {
              cache.products = cloudProducts;
              cache.lastFetched = now;
              return NextResponse.json(cloudProducts, {
                headers: {
                  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
              });
            }
          }
        }
      } catch (listErr) {
        console.warn("Fallback list() no disponible o error:", listErr);
      }
    }

    return NextResponse.json(cache.products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.warn("Error en GET /api/products:", error);
    return NextResponse.json(globalThis.__kamaluso_products_cache__?.products || []);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cache = globalThis.__kamaluso_products_cache__!;
    let updatedProducts: Product[] = [];

    if (Array.isArray(body)) {
      updatedProducts = body;
    } else if (body && body.id) {
      let currentProducts: Product[] = cache.products || [];
      const idx = currentProducts.findIndex((p) => p.id === body.id);
      if (idx >= 0) {
        currentProducts[idx] = body;
      } else {
        currentProducts = [body, ...currentProducts];
      }
      updatedProducts = currentProducts;
    }

    // Actualizar inmediatamente memoria del servidor
    cache.products = updatedProducts;
    cache.lastFetched = Date.now();

    // Guardar en Vercel Blob (1 sola Advanced Request solo al guardar)
    let blobUrl = cache.blobUrl || "";
    try {
      const blob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(updatedProducts, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      blobUrl = blob.url;
      cache.blobUrl = blobUrl;
    } catch (blobErr: any) {
      console.error("Error al guardar en Vercel Blob:", blobErr);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Error en Vercel Blob Storage: ${blobErr.message}`);
      }
    }

    // Invalidar instantáneamente la caché de Next.js
    try {
      revalidateTag("products");
      revalidatePath("/");
      revalidatePath("/admin");
      if (body && body.slug) {
        revalidatePath(`/p/${body.slug}`);
      }
      if (body && body.category) {
        revalidatePath(`/categoria/${body.category}`);
      }
    } catch (revalErr) {
      console.warn("Error en revalidateTag", revalErr);
    }

    return NextResponse.json({ success: true, url: blobUrl, products: updatedProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const cache = globalThis.__kamaluso_products_cache__!;
    const currentProducts = cache.products || [];
    const productToDelete = currentProducts.find((p) => p.id === id);

    // Borrado de imágenes huérfanas solo si existen
    if (productToDelete && productToDelete.images && productToDelete.images.length > 0) {
      for (const imgUrl of productToDelete.images) {
        if (imgUrl.includes("public.blob.vercel-storage.com") || imgUrl.includes("vercel-storage.com")) {
          try {
            await del(imgUrl);
          } catch (delErr) {
            console.warn("Error eliminando imagen de Blob Storage", delErr);
          }
        }
      }
    }

    const filtered = currentProducts.filter((p) => p.id !== id);
    cache.products = filtered;
    cache.lastFetched = Date.now();

    try {
      const blob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      cache.blobUrl = blob.url;
    } catch (blobErr: any) {
      console.error("Error al borrar en Vercel Blob:", blobErr);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Error en Vercel Blob Storage: ${blobErr.message}`);
      }
    }

    try {
      revalidateTag("products");
      revalidatePath("/");
      revalidatePath("/admin");
      if (productToDelete?.slug) {
        revalidatePath(`/p/${productToDelete.slug}`);
      }
    } catch (revalErr) {}

    return NextResponse.json({ success: true, products: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


