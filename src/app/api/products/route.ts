import fs from "fs";
import path from "path";
import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Product } from "@/types";
import { sanitizeProduct, INITIAL_PRODUCTS, ensureCompleteCatalog } from "@/lib/products";

export const dynamic = "force-dynamic";

const BLOB_PRODUCTS_FILENAME = "data/products.json";
const DIRECT_BLOB_PRODUCTS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/products.json";
const LOCAL_PRODUCTS_PATH = path.join(process.cwd(), "data", "products.json");

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
    blobUrl: DIRECT_BLOB_PRODUCTS_URL,
    lastFetched: 0,
  };
}

function writeLocalProductsFile(products: Product[]): void {
  try {
    const dir = path.dirname(LOCAL_PRODUCTS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch {
    // Normal en entornos serverless con sistema de archivos de solo lectura
  }
}

async function loadServerProducts(forceFresh = false): Promise<Product[]> {
  const cache = globalThis.__kamaluso_products_cache__!;
  const now = Date.now();

  if (!forceFresh && cache.products.length > 1 && now - cache.lastFetched < 60000) {
    return cache.products;
  }

  const baseUrl = cache.blobUrl || DIRECT_BLOB_PRODUCTS_URL;
  const targetUrl = forceFresh ? `${baseUrl}?t=${now}` : baseUrl;

  try {
    const res = await fetch(
      targetUrl,
      forceFresh
        ? {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
          }
        : { next: { revalidate: 60, tags: ["products"] } }
    );
    if (res.ok) {
      const cloudProducts = await res.json();
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        const complete = ensureCompleteCatalog(cloudProducts);
        cache.products = complete;
        cache.blobUrl = baseUrl;
        cache.lastFetched = now;
        return complete;
      }
    }
  } catch (fetchErr) {
    console.warn("Fetch directo a blob URL falló, usando memoria/INITIAL_PRODUCTS:", fetchErr);
  }

  if (cache.products.length > 1) {
    return cache.products;
  }

  const fallback = ensureCompleteCatalog(cache.products);
  cache.products = fallback;
  cache.lastFetched = now;
  return fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldReset = searchParams.get("reset") === "true";
    const cache = globalThis.__kamaluso_products_cache__!;

    if (shouldReset) {
      const restored = [...INITIAL_PRODUCTS];
      cache.products = restored;
      cache.lastFetched = Date.now();
      try {
        const newBlob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(restored, null, 2), {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
          contentType: "application/json",
        });
        cache.blobUrl = newBlob.url;
      } catch (e) {}
      writeLocalProductsFile(restored);
      return NextResponse.json(restored, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }

    const products = await loadServerProducts(false);
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.warn("Error en GET /api/products:", error);
    return NextResponse.json(
      ensureCompleteCatalog(globalThis.__kamaluso_products_cache__?.products || INITIAL_PRODUCTS)
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cache = globalThis.__kamaluso_products_cache__!;
    let updatedProducts: Product[] = [];

    if (Array.isArray(body)) {
      updatedProducts = ensureCompleteCatalog(body);
    } else if (body && body.id) {
      // CRÍTICO: Cargar siempre el catálogo actual desde Blob/INITIAL_PRODUCTS antes de modificar un producto individual
      const currentProducts = [...(await loadServerProducts(true))];
      const sanitizedBody = sanitizeProduct(body);
      const idx = currentProducts.findIndex((p) => p.id === sanitizedBody.id);
      if (idx >= 0) {
        currentProducts[idx] = sanitizedBody;
      } else {
        currentProducts.unshift(sanitizedBody);
      }
      updatedProducts = currentProducts;
    } else {
      return NextResponse.json({ error: "Payload de producto inválido" }, { status: 400 });
    }

    // Actualizar inmediatamente memoria del servidor y archivo local
    cache.products = updatedProducts;
    cache.lastFetched = Date.now();
    writeLocalProductsFile(updatedProducts);

    // Guardar en Vercel Blob (1 sola Advanced Request solo al guardar)
    let blobUrl = cache.blobUrl || DIRECT_BLOB_PRODUCTS_URL;
    try {
      const blob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(updatedProducts, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
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
    const currentProducts = await loadServerProducts(true);
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
    writeLocalProductsFile(filtered);

    try {
      const blob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
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


