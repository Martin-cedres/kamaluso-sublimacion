import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const card = {
    name: "Kamaluso Sublimación AI Agent",
    version: "1.0.0",
    description:
      "Agente comercial y técnico inteligente para cotizaciones, catálogo B2B y parámetros de sublimación en Uruguay.",
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
          "Consulta de stock, especificaciones y precios mayoristas en pesos uruguayos.",
      },
      {
        id: "sublimation-guide",
        name: "Ficha Técnica de Sublimación",
        description:
          "Tiempos (120s), temperaturas (170-180ºC) y técnica de enfriado para tapas de 350g.",
      },
      {
        id: "order-and-shipping",
        name: "Condiciones Comerciales y Envíos",
        description:
          "Despacho a todo Uruguay por DAC/Correo y medios de pago BROU/Prex/Mercado Pago.",
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
