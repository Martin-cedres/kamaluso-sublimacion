import { supabase } from "./supabase";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  format: string;
  fileSize: string;
  downloadUrl: string;
  created_at?: string;
}

export const INITIAL_RECURSOS: ResourceItem[] = [
  {
    id: "guia-sublimacion",
    title: "Guía Completa de Sublimación en Prensa Plana",
    description: "Instructivo paso a paso con tiempos, temperaturas (170ºC / 120s) y presión ideal para evitar ondulaciones.",
    format: "PDF",
    fileSize: "1.2 MB",
    downloadUrl: "https://www.kamaluso.com/guia-sublimacion-kamaluso.pdf",
  },
  {
    id: "plantilla-a5",
    title: "Plantilla para Tapas Agendas y Libretas A5 (15x21 cm)",
    description: "Plantilla con márgenes de sangrado exactos para diseñar tus tapas de agendas y libretas A5.",
    format: "PDF / PNG",
    fileSize: "850 KB",
    downloadUrl: "https://www.kamaluso.com/plantilla-tapas-a5-15x21.pdf",
  },
  {
    id: "plantilla-mini-blocks",
    title: "Plantilla para Mini Blocks (10x15 cm)",
    description: "Medidas exactas y guía de corte para tapas de mini blocks anotadores lisos o renglonados.",
    format: "PDF / PNG",
    fileSize: "520 KB",
    downloadUrl: "https://www.kamaluso.com/plantilla-block-10x15.pdf",
  },
  {
    id: "plantilla-cuadernos",
    title: "Plantilla para Cuadernos (17x22 cm)",
    description: "Formato de diseño con guías de alineación para tapas sublimables de cuadernos 17x22 cm.",
    format: "PDF / PNG",
    fileSize: "910 KB",
    downloadUrl: "https://www.kamaluso.com/plantilla-cuaderno-17x22.pdf",
  },
  {
    id: "plantilla-cuadernolas",
    title: "Plantilla para Cuadernolas A4 (21x30 cm)",
    description: "Plantilla de gran formato para estampado de tapas A4 con área imprimible completa.",
    format: "PDF / PNG",
    fileSize: "1.1 MB",
    downloadUrl: "https://www.kamaluso.com/plantilla-cuadernola-21x30.pdf",
  },
];

const LOCAL_STORAGE_KEY = "kamaluso_resources";

export async function getAllResources(): Promise<ResourceItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as ResourceItem[];
      }
    } catch (err) {
      console.warn("Error leyendo de Supabase resources, usando fallback", err);
    }
  }

  if (typeof window !== "undefined") {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Error parseando local resources", e);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_RECURSOS));
  }

  return INITIAL_RECURSOS;
}

export async function saveResource(item: Partial<ResourceItem>): Promise<ResourceItem> {
  const current = await getAllResources();
  const isEdit = Boolean(item.id);
  const newId = item.id || `res-${Date.now()}`;
  const newItem: ResourceItem = {
    id: newId,
    title: item.title || "Nuevo Recurso",
    description: item.description || "",
    format: item.format || "PDF",
    fileSize: item.fileSize || "1.0 MB",
    downloadUrl: item.downloadUrl || "#",
    created_at: item.created_at || new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from("resources").upsert(newItem).select().single();
      if (!error && data) return data as ResourceItem;
    } catch (err) {
      console.warn("Supabase resources upsert fallback a local", err);
    }
  }

  let updatedList: ResourceItem[];
  if (isEdit) {
    updatedList = current.map((r) => (r.id === newId ? newItem : r));
  } else {
    updatedList = [newItem, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  }

  return newItem;
}

export async function deleteResource(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (!error) console.log("Recurso eliminado de Supabase:", id);
    } catch (err) {
      console.warn("Error borrando de Supabase resources", err);
    }
  }

  const current = await getAllResources();
  const updated = current.filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
  return true;
}
