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
    id: "capibara-pdf",
    title: "DESCARGAR CAPIBARA.pdf",
    description: "Plantilla y diseño descargable Capibara en formato PDF.",
    format: "PDF",
    fileSize: "Descargar PDF",
    downloadUrl: "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000457-89be989beb/CAPIBARA.pdf?ph=904ccf23c3",
  },
  {
    id: "brillos-pdf",
    title: "DESCARGAR BRILLOS.pdf",
    description: "Plantilla y diseño descargable Brillos en formato PDF.",
    format: "PDF",
    fileSize: "Descargar PDF",
    downloadUrl: "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000456-d51c4d51c6/BRILLOS.pdf?ph=904ccf23c3",
  },
  {
    id: "colores-pdf",
    title: "DESCARGAR COLORES.pdf",
    description: "Plantilla y diseño descargable Colores en formato PDF.",
    format: "PDF",
    fileSize: "Descargar PDF",
    downloadUrl: "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000458-6825768258/COLORES.pdf?ph=904ccf23c3",
  },
  {
    id: "recetas-pdf",
    title: "DESCARGAR RECETAS.pdf",
    description: "Plantilla y diseño descargable Recetas en formato PDF.",
    format: "PDF",
    fileSize: "Descargar PDF",
    downloadUrl: "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000459-186f4186f5/RECETAS.pdf?ph=904ccf23c3",
  },
];

const LOCAL_STORAGE_KEY = "kamaluso_resources_v2";

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
