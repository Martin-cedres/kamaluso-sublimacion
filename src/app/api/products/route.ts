import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { INITIAL_PRODUCTS, CURRENT_CATALOG_VERSION } from "@/lib/products";
import { Product } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_PRODUCTS_FILENAME = "data/products.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "data/products.json" });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const products = await res.json();
        if (Array.isArray(products) && products.length > 0) {
          // Verificar si el JSON remoto en Vercel Blob está desactualizado (sin versión o v < v3)
          const isOutdated = products.some(
            (p: any) => !p.catalogVersion || p.catalogVersion < CURRENT_CATALOG_VERSION
          );

          if (isOutdated) {
            console.log("Catálogo en Vercel Blob desactualizado. Sincronizando fuente de verdad v3...");
            try {
              await put(BLOB_PRODUCTS_FILENAME, JSON.stringify(INITIAL_PRODUCTS, null, 2), {
                access: "public",
                addRandomSuffix: false,
                contentType: "application/json",
              });
            } catch (blobErr) {
              console.error("Error al actualizar Vercel Blob:", blobErr);
            }

            return NextResponse.json(INITIAL_PRODUCTS, {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
            });
          }

          return NextResponse.json(products, {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          });
        }
      }
    }
  } catch (error) {
    console.warn("Vercel Blob token omitido en local. Obteniendo catálogo en vivo de Producción...");
    const liveUrls = [
      `https://kamaluso-three.vercel.app/api/products?t=${Date.now()}`,
      `https://www.kamaluso.com/api/products?t=${Date.now()}`,
      `https://kamaluso.com/api/products?t=${Date.now()}`,
      `https://kamaluso-sublimacion.vercel.app/api/products?t=${Date.now()}`,
    ];

    for (const liveUrl of liveUrls) {
      try {
        const prodRes = await fetch(liveUrl, { cache: "no-store" });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData) && prodData.length > 0) {
            return NextResponse.json(prodData, {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
            });
          }
        }
      } catch (err) {}
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

