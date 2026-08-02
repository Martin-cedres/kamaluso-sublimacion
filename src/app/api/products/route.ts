import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { INITIAL_PRODUCTS, CURRENT_CATALOG_VERSION } from "@/lib/products";
import { Product } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_PRODUCTS_FILENAME = "data/products.json";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldReset = searchParams.get("reset") === "true";

    if (shouldReset) {
      try {
        await put(BLOB_PRODUCTS_FILENAME, JSON.stringify([], null, 2), {
          access: "public",
          addRandomSuffix: false,
          contentType: "application/json",
        });
      } catch (e) {}
      return NextResponse.json([], {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }

    const { blobs } = await list({ prefix: "data/products.json" });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const products = await res.json();
        if (Array.isArray(products)) {
          return NextResponse.json(products, {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          });
        }
      }
    }
  } catch (error) {
    console.warn("Error leyendo Vercel Blob en GET /api/products:", error);
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
    let updatedProducts: Product[] = [];

    if (Array.isArray(body)) {
      updatedProducts = body;
    } else if (body && body.id) {
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

    let blobUrl = "";
    try {
      const blob = await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(updatedProducts, null, 2), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      });
      blobUrl = blob.url;
    } catch (blobErr: any) {
      console.warn("Vercel Blob put omitido en entorno local:", blobErr.message);
    }

    // Invalidador instantáneo de Caché Next.js (ISR)
    try {
      revalidatePath("/");
      revalidatePath("/admin");
      if (body && body.slug) {
        revalidatePath(`/p/${body.slug}`);
      }
      if (body && body.category) {
        revalidatePath(`/categoria/${body.category}`);
      }
    } catch (revalErr) {
      console.warn("Error en revalidatePath", revalErr);
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

    const productToDelete = currentProducts.find((p) => p.id === id);

    // Borrado de imágenes huérfanas en Vercel Blob
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

    try {
      await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(filtered, null, 2), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      });
    } catch (blobErr: any) {
      console.warn("Vercel Blob put omitido en entorno local:", blobErr.message);
    }

    // Invalidador instantáneo de Caché Next.js (ISR)
    try {
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

