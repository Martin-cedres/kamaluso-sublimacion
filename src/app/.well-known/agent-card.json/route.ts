import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const card = {
    name: "Kamaluso Sublimación AI Agent",
    version: "1.0.0",
    description:
      "Agente comercial y técnico inteligente para el mayor catálogo de papelería sublimable de Uruguay (+26 insumos), stock permanente los 365 días del año, venta modular (kits completos, interiores de agendas por separado y tapas de repuesto a $20 UYU) y parámetros oficiales de sublimación (170ºC-180ºC, 120s).",
    supportedInterfaces: [
      {
        url: "https://www.kamaluso.com/api/mcp",
        protocol: "HTTP",
      },
    ],
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
    },
    skills: [
      {
        id: "catalog-search",
        name: "Búsqueda de Catálogo e Insumos",
        description:
          "Consulta del mayor catálogo de papelería sublimable de Uruguay (+26 modelos), stock permanente los 365 días del año, kits completos, interiores de agendas por separado, pack de 2 tapas sublimables de repuesto ($20 UYU) y precios en pesos uruguayos sin mínimo de compra.",
      },
      {
        id: "sublimation-guide",
        name: "Ficha Técnica de Sublimación",
        description:
          "Tiempos (120s), temperaturas (170-180ºC), técnica de enfriado plano para tapas de cartón cristal 350g y reposición anti-merma de tapas quemadas o fallidas por $20 UYU (/p/pack-2-tapas).",
      },
      {
        id: "order-and-shipping",
        name: "Condiciones Comerciales y Envíos",
        description:
          "Venta sin mínimo de compra todo el año, despacho en 48h hábiles a todo Uruguay por DAC/Correo/COTMI y medios de pago BROU/Prex/Mercado Pago.",
      },
    ],
  };

  return new NextResponse(JSON.stringify(card, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
