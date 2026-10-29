"use client";

import { useEffect } from "react";

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface ModelContextTarget {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => Promise<unknown>;
}

export function WebMcpProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const controller = new AbortController();

    // Detección compatible de ModelContext (document.modelContext o navigator.modelContext o window.modelContext)
    const docWithContext = document as unknown as { modelContext?: ModelContextTarget };
    const navWithContext = navigator as unknown as { modelContext?: ModelContextTarget };
    const winWithContext = window as unknown as { modelContext?: ModelContextTarget };

    const ctx: ModelContextTarget | undefined =
      docWithContext.modelContext ||
      navWithContext.modelContext ||
      winWithContext.modelContext;

    if (!ctx || typeof ctx.registerTool !== "function") {
      return;
    }

    const tools: ModelContextTool[] = [
      {
        name: "searchProducts",
        description: "Busca insumos de papelería sublimable (agendas, libretas, tapas 350g, espirales) en Kamaluso Uruguay.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda o producto" },
          },
        },
        execute: async (args: Record<string, unknown>) => {
          const q = String(args.query || "");
          const res = await fetch(`/api/products`);
          const data = await res.json();
          if (!Array.isArray(data)) return [];
          return data.filter((p: { name: string; description?: string }) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(q.toLowerCase()))
          );
        },
      },
      {
        name: "getProductDetails",
        description: "Obtiene información detallada, precio en UYU y disponibilidad de un insumo sublimable.",
        inputSchema: {
          type: "object",
          required: ["slugOrId"],
          properties: {
            slugOrId: { type: "string", description: "Slug o identificador del producto" },
          },
        },
        execute: async (args: Record<string, unknown>) => {
          const id = String(args.slugOrId || "");
          const res = await fetch(`/api/products`);
          const data = await res.json();
          if (!Array.isArray(data)) return null;
          return data.find(
            (p: { slug: string; id: string }) =>
              p.slug === id || String(p.id) === id
          ) || null;
        },
      },
      {
        name: "getSublimationParameters",
        description: "Obtiene la ficha técnica oficial de taller: temperatura (170ºC), tiempo (120s) y técnica de enfriado.",
        execute: async () => {
          return {
            temperatura: "170ºC - 180ºC",
            tiempo_segundos: 120,
            presion: "Media a Alta parejo",
            tipo_prensa: "Plana",
            material: "Cartón Cristal 350g con polímero",
            enfriado: "Obligatorio bajo peso plano frío durante 60-120 segundos tras retirar de la plancha",
          };
        },
      },
      {
        name: "getCommercialTerms",
        description: "Condiciones comerciales en Uruguay: medios de pago (BROU, Prex, Mercado Pago) y despachos diarios por DAC y Correo.",
        execute: async () => {
          return {
            moneda: "UYU",
            compra_minima: "Sin mínimo",
            envios: "Diarios a todo Uruguay por DAC, Correo Uruguayo y COTMI",
            medios_pago: ["BROU", "Prex", "OCA Blue", "Midinero", "Abitab", "Redpagos", "Mercado Pago"],
            tiempo_despacho: "48 horas hábiles",
          };
        },
      },
    ];

    tools.forEach((tool) => {
      try {
        ctx.registerTool(tool, { signal: controller.signal }).catch(() => {
          // Ignore registration failures if unsupported
        });
      } catch {
        // Silently catch older implementations
      }
    });

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
