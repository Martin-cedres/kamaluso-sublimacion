import { Product, Category } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const CURRENT_CATALOG_VERSION = 3;

export const CATEGORIES: Category[] = [
  { id: "todos", name: "Todos los sublimables", slug: "todos" },
  { id: "agendas", name: "Agendas Sublimables", slug: "agendas" },
  { id: "libretas", name: "Libretas y Cuadernos", slug: "libretas" },
  { id: "blocks-planners", name: "Blocks y Planners", slug: "blocks-planners" },
  { id: "kits-promos", name: "Kits Mayoristas", slug: "kits-promos" },
];

export const INITIAL_PRODUCTS: Product[] = [];

const LOCAL_PRODUCTS_KEY = "kamaluso_custom_products";
const DELETED_PRODUCTS_KEY = "kamaluso_deleted_product_ids";
const CATALOG_VERSION_KEY = "kamaluso_catalog_version";

function getLocalStoredProducts(): Product[] | null {
  if (typeof window === "undefined") return null;

  // Limpiar memoria local del navegador si la versión del catálogo cambió a borrón cero (Versión 3+)
  const savedVersion = localStorage.getItem(CATALOG_VERSION_KEY);
  if (!savedVersion || Number(savedVersion) < CURRENT_CATALOG_VERSION) {
    localStorage.removeItem(LOCAL_PRODUCTS_KEY);
    localStorage.removeItem(DELETED_PRODUCTS_KEY);
    localStorage.setItem(CATALOG_VERSION_KEY, String(CURRENT_CATALOG_VERSION));
    return null;
  }

  const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((p): p is Product => Boolean(p && typeof p === "object" && p.id && p.name));
  } catch (e) {
    return null;
  }
}

function saveLocalStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function getDeletedProductIds(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(DELETED_PRODUCTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as string[];
  } catch (e) {
    return [];
  }
}

function saveDeletedProductId(id: string): void {
  if (typeof window === "undefined") return;
  const list = getDeletedProductIds();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(list));
  }
}

function removeDeletedProductId(id: string): void {
  if (typeof window === "undefined") return;
  const list = getDeletedProductIds().filter((dId) => dId !== id);
  localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(list));
}

function mergeWithLocal(remoteProducts: Product[], localProducts: Product[] | null): Product[] {
  const deletedIds = getDeletedProductIds();
  const productMap = new Map<string, Product>();

  if (Array.isArray(remoteProducts)) {
    remoteProducts.forEach((p) => {
      if (p && p.id && !deletedIds.includes(p.id)) {
        productMap.set(p.id, p);
      }
    });
  }

  if (localProducts && localProducts.length > 0) {
    localProducts.forEach((lp) => {
      if (lp && lp.id && !deletedIds.includes(lp.id)) {
        productMap.set(lp.id, lp);
      }
    });
  }

  return Array.from(productMap.values());
}

export async function getAllProducts(): Promise<Product[]> {
  const localStored = getLocalStoredProducts();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return mergeWithLocal(data as Product[], localStored);
      }
    } catch (e) {
      console.warn("Supabase fetch failed, fallbacking", e);
    }
  }

  // Si se ejecuta en el navegador o servidor, consultar la API de Nube de Vercel Blob
  try {
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = host ? `${protocol}://${host.replace(/^https?:\/\//, "")}` : "";
    const url = typeof window !== "undefined"
      ? `/api/products?t=${Date.now()}`
      : (baseUrl ? `${baseUrl}/api/products?t=${Date.now()}` : "http://localhost:3000/api/products");

    const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
    if (res.ok) {
      const cloudProducts = await res.json();
      if (Array.isArray(cloudProducts)) {
        return mergeWithLocal(cloudProducts, localStored);
      }
    }
  } catch (e) {
    console.warn("Error al obtener productos de la nube de Vercel", e);
  }

  return mergeWithLocal(INITIAL_PRODUCTS, localStored);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  const direct = products.find((p) => p.slug === slug);
  if (direct) return direct;

  // Fallback inteligente para variantes de slug sin año o variaciones (ej: agenda-semanal-2027, agenda-sublimable-semanal, agenda-semanal)
  const normTarget = slug.toLowerCase().replace(/-202[0-9]/g, "").replace(/[^a-z0-9]/g, "");
  return products.find((p) => {
    const normP = p.slug.toLowerCase().replace(/-202[0-9]/g, "").replace(/[^a-z0-9]/g, "");
    return normP === normTarget || normP.includes(normTarget) || normTarget.includes(normP);
  });
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getAllProducts();
  if (categorySlug === "todos" || !categorySlug) return products;
  return products.filter((p) => p.category === categorySlug);
}

export async function generateUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
  const products = await getAllProducts();
  let slug = baseSlug;
  let counter = 1;
  while (products.some((p) => p.slug === slug && p.id !== currentId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// Operaciones CRUD para el Panel de Administración

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const id = product.id || String(Date.now());
  const initialSlug = product.slug || id;
  const uniqueSlug = await generateUniqueSlug(initialSlug, id);
  
  const fullProduct: Product = {
    id,
    name: product.name || "Nuevo Producto",
    slug: uniqueSlug,
    description: product.description || "",
    price: product.price !== undefined && product.price !== null ? Number(product.price) : 0,
    comparativePrice: product.comparativePrice ? Number(product.comparativePrice) : undefined,
    currency: "UYU",
    category: product.category || "agendas",
    badge: product.badge,
    hasPromoKit: product.hasPromoKit !== undefined ? product.hasPromoKit : false,
    inStock: product.inStock !== undefined ? product.inStock : true,
    images: product.images && product.images.length > 0 ? product.images : [],
  };

  // Revertir eliminación si existía previamente
  removeDeletedProductId(id);

  // 1. Guardar de forma inmediata e incondicional en localStorage
  let localProducts = getLocalStoredProducts() || [];
  const idx = localProducts.findIndex((p) => p.id === fullProduct.id);
  if (idx >= 0) {
    localProducts[idx] = fullProduct;
  } else {
    localProducts = [fullProduct, ...localProducts];
  }
  saveLocalStoredProducts(localProducts);

  // 2. Guardar en Supabase si está activo
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("products").upsert({
        id: fullProduct.id,
        name: fullProduct.name,
        slug: fullProduct.slug,
        description: fullProduct.description,
        price: fullProduct.price,
        comparative_price: fullProduct.comparativePrice,
        currency: fullProduct.currency,
        category: fullProduct.category,
        badge: fullProduct.badge,
        has_promo_kit: fullProduct.hasPromoKit,
        in_stock: fullProduct.inStock,
        images: fullProduct.images,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error al guardar en Supabase", err);
    }
  }

  // 3. Guardar en la Nube de Vercel Blob vía API Route
  try {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullProduct),
    });
  } catch (e) {
    console.error("Error al guardar producto en Vercel Blob Cloud", e);
  }

  return fullProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  saveDeletedProductId(id);

  let localProducts = getLocalStoredProducts() || [];
  localProducts = localProducts.filter((p) => p.id !== id);
  saveLocalStoredProducts(localProducts);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch (e) {}
  }

  try {
    await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.error("Error al eliminar producto en Vercel Blob Cloud", e);
  }

  return true;
}
