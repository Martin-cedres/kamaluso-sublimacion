import { Product, Category } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const CATEGORIES: Category[] = [
  { id: "todos", name: "Todos los sublimables", slug: "todos" },
  { id: "agendas", name: "Agendas Sublimables", slug: "agendas" },
  { id: "libretas", name: "Libretas y Cuadernos", slug: "libretas" },
  { id: "blocks-planners", name: "Blocks y Planners", slug: "blocks-planners" },
  { id: "kits-promos", name: "Kits Mayoristas", slug: "kits-promos" },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "200001488",
    name: "Agenda Semanal 2026/27",
    slug: "agenda-semanal-2027",
    description:
      "Agenda semanal sublimable para personalizar. Tamaño 15x21cm. Incluye tapa y contratapa sublimables de 350gr, espiral para enrular, interior impreso. Estamos en el departamento de San José, hacemos envíos a todo el país. 180 PAGINAS. Parámetros para sublimar: 170ºC durante 120 segundos.",
    price: 170,
    comparativePrice: 190,
    currency: "UYU",
    category: "agendas",
    badge: "NUEVO 2027",
    hasPromoKit: true,
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000243-e7ef8e7efb/700/WhatsApp%20Image%202022-05-18%20at%203.08.10%20PM%20%281%29.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000244-b58b3b58b6/700/WhatsApp%20Image%202022-05-18%20at%203.08.10%20PM.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200000800",
    name: "Agenda 2 días a la vista 2026/27",
    slug: "agenda-2-dias-a-la-vista-2024",
    description:
      "Agenda 2 días por hoja sublimable. Tamaño 15x21 cm. El kit incluye las hojas interiores impresas, tapa y contratapa sublimables de 350gr y el espiral para enrular. El interior contiene: Hoja de datos, Calendario anual, Organizador anual, Hoja de contraseñas, Planilla de gastos, Portadas mes a mes, Diagramación dos días por página, Agenda telefónica, Hojas para notas. 280 PAGINAS EN TOTAL. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 240,
    comparativePrice: 260,
    currency: "UYU",
    category: "agendas",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000282-391a4391a7/700/Agenda%20sublimable%20dos%20dias%20por%20hoja%202022%20%20kamaluso%201.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000283-bc117bc11a/700/agenda%20sublimable%202022%20tapa.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200000801",
    name: "Agenda 1 día a la vista 2026/27",
    slug: "agenda-1-dia-a-la-vista-2024",
    description:
      "Agenda 1 día por página sublimable. Tamaño 15x21 cm. El kit incluye las hojas interiores impresas, tapa y contratapa sublimables de 350gr y el espiral para enrular. El interior contiene: Hoja de datos, Calendario anual, Organizador anual, Hoja de contraseñas, Planilla de gastos, Portadas mes a mes, Diagramación un día por página, Agenda telefónica, Hojas para notas. 420 PAGINAS EN TOTAL. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 310,
    comparativePrice: 350,
    currency: "UYU",
    category: "agendas",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000284-b73e8b73eb/700/agenda%20sublimable%202022%201%20dia%20por%20p%C3%A1gina%20kamaluso.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000285-1d8571d85b/700/agenda%20sublimable%202022%20tapa%201%20dia%20por%20p%C3%A1gina.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200000949",
    name: "KIT 10 + 1 de Regalo",
    slug: "kit-10-1-de-regalo",
    description:
      "El KIT incluye 10 agendas semanales en cualquiera de sus presentaciones a elección (común, vertical, floral, surtidas) + 1 de regalo. Agenda semanal sublimable para personalizar. Tamaño 15x21cm. Incluye tapa y contratapa sublimables de 350gr, espiral para enrular, interior impreso. 180 PAGINAS. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 1600,
    comparativePrice: 1750,
    currency: "UYU",
    category: "kits-promos",
    badge: "PROMO MAYORISTA",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000451-7c2877c288/700/kit-7.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000243-e7ef8e7efb/700/WhatsApp%20Image%202022-05-18%20at%203.08.10%20PM%20%281%29.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000244-b58b3b58b6/700/WhatsApp%20Image%202022-05-18%20at%203.08.10%20PM.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200001212",
    name: "Citas juntos 100",
    slug: "citas-juntos-100",
    description:
      "Cuaderno temático 'Citas juntos 100' sublimable para personalizar. Tamaño 15x21 cm. El kit incluye las hojas interiores impresas en excelente calidad, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 155,
    currency: "UYU",
    category: "libretas",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000401-cc2cccc2ce/700/100%20citas%20tapa.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000398-a27e6a27e7/450/100%20citas%20tapa.png?ph=904ccf23c3",
    ],
  },
  {
    id: "200001111",
    name: "Planner Verde",
    slug: "planner-verde",
    description:
      "Organizador / Planner perpetuo sublimable. Tamaño 15x21 cm. Incluye hojas interiores organizadoras sin fecha fija, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 240,
    currency: "UYU",
    category: "blocks-planners",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000363-a5af0a5af3/700/Planner%20verde.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000362-81e4381e45/450/Planner%20verde.jpeg?ph=904ccf23c3",
    ],
  },
  {
    id: "200000116",
    name: "Libreta tamaño 15x21 cm (A5)",
    slug: "libreta-sublimable-tamano-15x21-cm",
    description:
      "Libreta sublimable A5. Tamaño 15x21 cm. Incluye hojas interiores impresas, tapa y contratapa sublimables de 350gr, espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 140,
    comparativePrice: 170,
    currency: "UYU",
    category: "libretas",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000298-2877d28780/700/Libreta%20A5%20sublimable.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000299-4ce4c4ce4d/700/Libreta%20A5%20sublimable%202.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200000931",
    name: "Cuaderno 17x22",
    slug: "cuaderno",
    description:
      "Cuaderno sublimable formato 17x22 cm. El kit incluye hojas interiores impresas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en el departamento de San José, hacemos envíos a todo el país.",
    price: 180,
    currency: "UYU",
    category: "libretas",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000357-6cb706cb71/700/IMG-20231118-WA0014.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000356-49eed49eee/450/IMG-20231118-WA0014.jpeg?ph=904ccf23c3",
    ],
  },
  {
    id: "200000056",
    name: "Block 10x15cm con renglones",
    slug: "copia-de-block-sublimable-10x15cm-con-renglones",
    description:
      "Block 10x15cm renglonado sublimable para personalizar. El kit incluye hojas interiores renglonadas impresas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en San José, hacemos envíos a todo el país.",
    price: 85,
    currency: "UYU",
    category: "blocks-planners",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000314-a8a81a8a85/700/block%20sublimable%20kamaluso%20san%20jos%C3%A9%20%202-4.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000315-0d2640d267/700/block%20sublimable%20kamaluso%20san%20jos%C3%A9%20%202-3.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200000052",
    name: "Block 10x15cm liso",
    slug: "block-sublimable-10x15cm-sin-renglones",
    description:
      "Block 10x15cm liso sublimable para personalizar. El kit incluye hojas interiores lisas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en San José, hacemos envíos a todo el país.",
    price: 60,
    currency: "UYU",
    category: "blocks-planners",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000320-2cac22cac5/700/block%20sublimable%20kamaluso%20san%20jos%C3%A9%20%201.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000321-4f1ab4f1ad/700/block%20sublimable%20kamaluso%20san%20jos%C3%A9%20%201-2.webp?ph=904ccf23c3",
    ],
  },
  {
    id: "200000115",
    name: "Cuadernola 21x30",
    slug: "recetario-infantil-sublimable1",
    description:
      "Cuadernola A4 21x30cm sublimable para personalizar. El kit incluye las hojas interiores impresas, tapa y contratapa sublimables de 350gr y espiral para enrular. Parámetros para sublimar: 170ºC durante 120 segundos. Estamos en San José, hacemos envíos a todo el país.",
    price: 180,
    currency: "UYU",
    category: "libretas",
    inStock: true,
    images: [
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000300-89b2889b2b/700/Cuadernola%2021x30cm%20sublimable.webp?ph=904ccf23c3",
      "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000092-7af567af59/450/Cuadernola%2021x30cm%20sublimable.jpeg?ph=904ccf23c3",
    ],
  },
];

const LOCAL_PRODUCTS_KEY = "kamaluso_custom_products";

function getLocalStoredProducts(): Product[] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Product[];
  } catch (e) {
    return null;
  }
}

function saveLocalStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

export async function getAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn("Supabase fetch failed, fallbacking", e);
    }
  }

  // Si se ejecuta en el navegador o servidor, consultar la API de Nube de Vercel Blob
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = typeof window !== "undefined" ? `/api/products?t=${Date.now()}` : `${baseUrl}/api/products`;
    const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
    if (res.ok) {
      const cloudProducts = await res.json();
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        return cloudProducts;
      }
    }
  } catch (e) {
    console.warn("Error al obtener productos de la nube de Vercel", e);
  }

  return INITIAL_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getAllProducts();
  if (categorySlug === "todos" || !categorySlug) return products;
  return products.filter((p) => p.category === categorySlug);
}

// Operaciones CRUD para el Panel de Administración

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const id = product.id || String(Date.now());
  
  const fullProduct: Product = {
    id,
    name: product.name || "Nuevo Producto",
    slug: product.slug || id,
    description: product.description || "",
    price: product.price || 0,
    comparativePrice: product.comparativePrice,
    currency: "UYU",
    category: product.category || "agendas",
    badge: product.badge,
    hasPromoKit: product.hasPromoKit !== undefined ? product.hasPromoKit : false,
    inStock: product.inStock !== undefined ? product.inStock : true,
    images: product.images && product.images.length > 0 ? product.images : ["/agenda_fondo_kamaluso.jpg"],
  };

  if (isSupabaseConfigured && supabase) {
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
  }

  // Guardar en la Nube de Vercel Blob vía API Route
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
  if (isSupabaseConfigured && supabase) {
    await supabase.from("products").delete().eq("id", id);
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
