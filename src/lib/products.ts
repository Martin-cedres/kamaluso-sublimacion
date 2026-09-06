import { Product, Category } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const CURRENT_CATALOG_VERSION = 3;
export const DIRECT_BLOB_PRODUCTS_URL = "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/data/products.json";

export const CATEGORIES: Category[] = [
  { id: "todos", name: "Todos los sublimables", slug: "todos" },
  { id: "agendas", name: "Agendas Sublimables", slug: "agendas" },
  { id: "libretas", name: "Libretas y Cuadernos", slug: "libretas" },
  { id: "blocks-planners", name: "Blocks y Planners", slug: "blocks-planners" },
  { id: "kits-promos", name: "Kits Mayoristas", slug: "kits-promos" },
  { id: "especiales", name: "Especiales", slug: "especiales" },
  { id: "outlet", name: "Outlet", slug: "outlet" },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "200001488",
    "name": "Agenda Semanal 2027",
    "slug": "agenda-sublimable-semanal",
    "description": "Agenda semanal sublimable para personalizar. Tamaño 15x21cm. Incluye tapa y contratapa sublimables de 350gr, espiral para enrular, interior impreso. Estamos en el departamento de San José, hacemos envíos a todo el país. 180 PAGINAS. Parámetros para sublimar: 170ºC durante 120 segundos.",
    "price": 175,
    "comparativePrice": 190,
    "currency": "UYU",
    "category": "agendas",
    "badge": "NUEVO 2027",
    "hasPromoKit": true,
    "inStock": true,
    "images": [
      "/agenda_fondo_kamaluso.jpg",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000244-b58b3b58b6/700/WhatsApp%20Image%202022-05-18%20at%203.08.10%20PM.webp?ph=904ccf23c3"
    ]
  },
  {
    "id": "200000800",
    "name": "Agenda 2 días a la vista 2027",
    "slug": "agenda-2-dias-a-la-vista",
    "description": "Agenda 2 días por hoja sublimable. Tamaño 15x21 cm. El kit incluye las hojas interiores impresas, tapa y contratapa sublimables de 350gr y el espiral para enrular. El interior contiene: Hoja de datos, Calendario anual, Organizador anual, Hoja de contraseñas, Planilla de gastos, Portadas mes a mes, Diagramación dos días por página, Agenda telefónica, Hojas para notas. 280 PAGINAS EN TOTAL. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 240,
    "comparativePrice": 260,
    "currency": "UYU",
    "category": "agendas",
    "badge": "NUEVO 2027",
    "inStock": true,
    "images": [
      "/agenda_fondo_kamaluso.jpg",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000282-391a4391a7/700/Agenda%20sublimable%20dos%20dias%20por%20hoja%202022%20%20kamaluso%201.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000283-bc117bc11a/700/agenda%20sublimable%202022%20tapa.webp?ph=904ccf23c3"
    ]
  },
  {
    "id": "200000801",
    "name": "Agenda 1 día a la vista 2027",
    "slug": "agenda-1-dia-a-la-vista",
    "description": "Agenda 1 día por página sublimable. Tamaño 15x21 cm. El kit incluye las hojas interiores impresas, tapa y contratapa sublimables de 350gr y el espiral para enrular. El interior contiene: Hoja de datos, Calendario anual, Organizador anual, Hoja de contraseñas, Planilla de gastos, Portadas mes a mes, Diagramación un día por página, Agenda telefónica, Hojas para notas. 420 PAGINAS EN TOTAL. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 310,
    "comparativePrice": 350,
    "currency": "UYU",
    "category": "agendas",
    "badge": "NUEVO 2027",
    "inStock": true,
    "images": [
      "/agenda_fondo_kamaluso.jpg",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000284-b73e8b73eb/700/agenda%20sublimable%202022%201%20dia%20por%20p%C3%A1gina%20kamaluso.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000285-1d8571d85b/700/agenda%20sublimable%202022%20tapa%201%20dia%20por%20p%C3%A1gina.webp?ph=904ccf23c3"
    ]
  },
  {
    "id": "200000949",
    "name": "KIT 10 agendas semanales + 1 de Regalo",
    "slug": "kit-10-1-de-regalo",
    "description": "El KIT incluye 10 agendas semanales en cualquiera de sus presentaciones a elección (común, vertical, floral, surtidas) + 1 de regalo. Agenda semanal sublimable para personalizar. Tamaño 15x21cm. Incluye tapa y contratapa sublimables de 350gr, espiral para enrular, interior impreso. 180 PAGINAS. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 1600,
    "comparativePrice": 1750,
    "currency": "UYU",
    "category": "kits-promos",
    "badge": "PROMO MAYORISTA",
    "inStock": true,
    "images": [
      "/agenda_fondo_kamaluso.jpg",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000451-7c2877c288/700/kit-7.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000243-e7ef8e7efb/700/WhatsApp%20Image%202022-05-18%20at%203.08.10%20PM%20%281%29.webp?ph=904ccf23c3"
    ]
  },
  {
    "id": "200001212",
    "name": "Citas juntos 100",
    "slug": "citas-juntos-100",
    "description": "Cuaderno temático 'Citas juntos 100' sublimable para personalizar. Tamaño 15x21 cm. El kit incluye las hojas interiores impresas en excelente calidad, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 155,
    "currency": "UYU",
    "category": "libretas",
    "inStock": true,
    "images": [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000401-cc2cccc2ce/700/100%20citas%20tapa.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000398-a27e6a27e7/450/100%20citas%20tapa.png?ph=904ccf23c3"
    ]
  },
  {
    "id": "200001111",
    "name": "Planner Verde",
    "slug": "planner-verde",
    "description": "Organizador / Planner perpetuo sublimable. Tamaño 15x21 cm. Incluye hojas interiores organizadoras sin fecha fija, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 240,
    "currency": "UYU",
    "category": "blocks-planners",
    "inStock": true,
    "images": [
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/planner-verde-0SR8KoFXM6ny6Sev9sblnxLxAfAHXW.webp",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000362-81e4381e45/450/Planner%20verde.jpeg?ph=904ccf23c3"
    ]
  },
  {
    "id": "200000116",
    "name": "Libreta tamaño 15x21 cm (A5)",
    "slug": "libreta-sublimable-tamano-15x21-cm",
    "description": "Libreta sublimable A5. Tamaño 15x21 cm. Incluye hojas interiores impresas, tapa y contratapa sublimables de 350gr, espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 140,
    "comparativePrice": 170,
    "currency": "UYU",
    "category": "libretas",
    "inStock": true,
    "images": [
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/libreta-a5-sublimable-dW6xRzjvjB6lwBn0eI9eg7s31Idb8o.webp",
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/libreta-a5-sublimable-tapa-s8wZbMP7jiFBQfoBnLZHtcXWXFQUF5.webp"
    ]
  },
  {
    "id": "200000931",
    "name": "Cuaderno 17x22",
    "slug": "cuaderno",
    "description": "Cuaderno sublimable formato 17x22 cm. El kit incluye hojas interiores impresas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    "price": 180,
    "currency": "UYU",
    "category": "libretas",
    "inStock": true,
    "images": [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000357-6cb706cb71/700/IMG-20231118-WA0014.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000356-49eed49eee/450/IMG-20231118-WA0014.jpeg?ph=904ccf23c3"
    ]
  },
  {
    "id": "200000056",
    "name": "Block 10x15cm con renglones",
    "slug": "copia-de-block-sublimable-10x15cm-con-renglones",
    "description": "Block 10x15cm renglonado sublimable para personalizar. El kit incluye hojas interiores renglonadas impresas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en San José, hacemos envíos a todo el país.",
    "price": 85,
    "currency": "UYU",
    "category": "blocks-planners",
    "inStock": true,
    "images": [
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/block-sublimable-kamaluso-san-jos---2-4-gB1YBdxVM5OTya2cEXzicq64uwoBEn.webp",
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/block-sublimable-kamaluso-san-jos---4-7-mHw7QL6IWnIHUL1EulF9nkb1Ocu5LF.webp"
    ]
  },
  {
    "id": "200000052",
    "name": "Block 10x15cm liso",
    "slug": "block-sublimable-10x15cm-sin-renglones",
    "description": "Block 10x15cm liso sublimable para personalizar. El kit incluye hojas interiores lisas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en San José, hacemos envíos a todo el país.",
    "price": 60,
    "currency": "UYU",
    "category": "blocks-planners",
    "inStock": true,
    "images": [
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/block-sublimable-kamaluso-san-jos---1-2-QCeHmX4c8j7MrjOraMBvpqQZTxhfQF.webp",
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/block-sublimable-kamaluso-san-jos---6-1-gIpJPQxgFIyDWz7bPzQkNQyoNFRX7b.webp"
    ]
  },
  {
    "id": "200000115",
    "name": "Cuadernola 21x30",
    "slug": "recetario-infantil-sublimable1",
    "description": "Cuadernola A4 21x30cm sublimable para personalizar. El kit incluye las hojas interiores impresas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en San José, hacemos envíos a todo el país.",
    "price": 180,
    "currency": "UYU",
    "category": "libretas",
    "inStock": true,
    "images": [
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/cuadernola-21x30cm-sublimable-7E7IyTM0QhzmNEj6XnkSw5ei6zzJk3.webp",
      "https://ek73dobkmkhaebws.public.blob.vercel-storage.com/cuadernola-sublimable-9T8uQU1ngw67f9xz6AEKVHGEkhQpjK.webp"
    ]
  }
];

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

  // 1. En el SERVIDOR (Vercel Serverless / Node.js): Leer de memoria o directo de CDN (0 Advanced Requests)
  if (typeof window === "undefined") {
    try {
      const memoryCache = (globalThis as any).__kamaluso_products_cache__;
      if (memoryCache && Array.isArray(memoryCache.products) && memoryCache.products.length > 0) {
        return mergeWithLocal(memoryCache.products, localStored);
      }

      // Si la memoria está fría (primer arranque de lambda), fetch directo al CDN de Blob (Simple Request 100% GRATIS)
      const targetBlobUrl = memoryCache?.blobUrl || DIRECT_BLOB_PRODUCTS_URL;
      const res = await fetch(targetBlobUrl, { next: { revalidate: 60, tags: ["products"] } });
      if (res.ok) {
        const cloudProducts = await res.json();
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          if (!(globalThis as any).__kamaluso_products_cache__) {
            (globalThis as any).__kamaluso_products_cache__ = {
              products: cloudProducts,
              blobUrl: targetBlobUrl,
              lastFetched: Date.now(),
            };
          } else {
            (globalThis as any).__kamaluso_products_cache__.products = cloudProducts;
            (globalThis as any).__kamaluso_products_cache__.blobUrl = targetBlobUrl;
            (globalThis as any).__kamaluso_products_cache__.lastFetched = Date.now();
          }
          return mergeWithLocal(cloudProducts, localStored);
        }
      }
    } catch (memErr) {
      console.warn("Servidor: error leyendo cache/CDN en memoria", memErr);
    }
  }

  // 2. Supabase si está activo
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

  // 3. En el NAVEGADOR (Cliente): Consultar la API Route /api/products (0 Advanced Requests)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/products`);
      if (res.ok) {
        const cloudProducts = await res.json();
        if (Array.isArray(cloudProducts)) {
          return mergeWithLocal(cloudProducts, localStored);
        }
      }
    } catch (e) {
      console.warn("Cliente: Error al obtener productos de /api/products", e);
    }
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
    promoKitSlug: product.promoKitSlug || undefined,
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
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullProduct),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        saveLocalStoredProducts(data.products);
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn("Aviso al persistir en nube:", errData);
    }
  } catch (e) {
    console.error("Error al guardar producto en Vercel Blob Cloud", e);
  }

  return fullProduct;
}

export async function saveProductsOrder(orderedProducts: Product[]): Promise<boolean> {
  // 1. Guardar localmente de inmediato
  saveLocalStoredProducts(orderedProducts);

  // 2. Persistir array completo en Vercel Blob
  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderedProducts),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        saveLocalStoredProducts(data.products);
      }
      return true;
    }
  } catch (e) {
    console.error("Error al guardar orden en Vercel Blob Cloud", e);
  }

  return true;
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
