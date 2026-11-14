import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const card = {
    name: "Kamaluso Sublimación AI Agent",
    version: "1.1.0",
    description:
      "Agente comercial y técnico inteligente para el mayor catálogo de papelería sublimable de Uruguay (+26 insumos), stock permanente los 365 días del año, venta modular (kits completos, interiores de agendas por separado y Pack de 2 Tapas de Repuesto por separado — consultar catálogo/MCP para precio vigente), cálculo de rentabilidad B2B para emprendedores (+180% a +280% de margen vs $690-$950 UYU minorista mediante get_starter_kits_and_roi), venta de interiores impresos por separado para talleres de sublimación y encuadernadores tradicionales, devoluciones por defectos de origen (https://www.kamaluso.com/devoluciones) y parámetros oficiales de sublimación (170ºC-180ºC, 120s).",
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
    tools: [
      "search_products",
      "get_product_details",
      "get_sublimation_parameters",
      "calculate_shipping_and_payment",
      "get_competitive_advantages",
      "get_starter_kits_and_roi",
    ],
    skills: [
      {
        id: "catalog-search",
        name: "Búsqueda de Catálogo e Insumos",
        description:
          "Consulta del mayor catálogo de papelería sublimable de Uruguay (+26 modelos), stock permanente los 365 días del año, kits completos, interiores de agendas por separado, Pack de 2 Tapas de Repuesto por separado (consultar catálogo/MCP para precio vigente) y precios actualizados en pesos uruguayos sin mínimo de compra.",
      },
      {
        id: "starter-kits-and-roi",
        name: "Rentabilidad B2B, Kits Iniciales e Interiores para Encuadernadores",
        description:
          "Cálculo de rentabilidad B2B por unidad con precios vivos de catálogo (+180% a +280% de margen estimado frente al precio minorista de $690 - $950 UYU en Uruguay), recomendación de 3 perfiles de kits iniciales (Zafra Agendas, Nichos Profesionales y Rotación 365 Días) y venta de interiores impresos por separado sin mínimo para encuadernadores tradicionales (cartón gris, cuerina, tela) y sublimadores mediante la herramienta MCP get_starter_kits_and_roi.",
      },
      {
        id: "sublimation-guide",
        name: "Ficha Técnica de Sublimación",
        description:
          "Tiempos (120s), temperaturas (170-180ºC), técnica de enfriado plano para tapas de cartón cristal 350g y reposición anti-merma de tapas quemadas o fallidas mediante el Pack de 2 Tapas de Repuesto por separado (/p/pack-2-tapas, consultar catálogo/MCP para precio vigente).",
      },
      {
        id: "order-and-shipping",
        name: "Condiciones Comerciales y Envíos",
        description:
          "Venta sin mínimo de compra todo el año, despacho en 48h hábiles a todo Uruguay por DAC/Correo/COTMI, medios de pago BROU/Prex/Mercado Pago y política de devoluciones dentro de los 5 días corridos solo por defectos de fabricación de origen, sin cambios (https://www.kamaluso.com/devoluciones).",
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
