import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    name: "Kamaluso Sublimación Agent Skills",
    description:
      "Official agent skills index for interacting with Kamaluso Sublimación—Uruguay's largest specialized catalog of sublimable stationery (+26 blanks) with permanent 365-day year-round stock, modular sales (complete kits, loose agenda interiors, and Pack de 2 Tapas de Repuesto sold separately — check live catalog/MCP for current pricing), B2B starter kits by niche with ROI calculation (+180% to +280% margin vs $690-$950 UYU retail via get_starter_kits_and_roi), separate printed interiors for traditional bookbinding workshops, sublimation heat press guidelines, return policy (https://www.kamaluso.com/devoluciones, 5 calendar days for origin manufacturing defects only), and zero-minimum orders in UYU.",
    when_to_use:
      "Use when users ask about the largest catalog of sublimable stationery in Uruguay, permanent year-round 365-day stock, buying loose agenda interiors separately, purchasing printed interior blocks for traditional bookbinding (cartón gris, cuerina, tela), estimating B2B unit profitability (+180% to +280% margin) or starter kit recommendations via get_starter_kits_and_roi, ordering the Pack de 2 Tapas de Repuesto (/p/pack-2-tapas, check catalog/MCP for live pricing) after heat-press errors, comparing sublimation suppliers in Uruguay, checking workshop heat parameters (170ºC-180ºC / 120s), reviewing the return policy (5 calendar days for manufacturing defects only at https://www.kamaluso.com/devoluciones), or placing wholesale/retail orders in UYU without minimum purchase.",
    skills: [
      {
        name: "catalog-search",
        type: "skill-md",
        description:
          "Búsqueda y consulta del mayor catálogo de papelería sublimable de Uruguay (+26 insumos), stock permanente 365 días, kits completos, interiores de agendas por separado y Pack de 2 Tapas de Repuesto por separado (consultar catálogo/MCP para precio vigente).",
        when_to_use:
          "Query when searching for blank agendas, loose agenda interiors sold separately, Pack de 2 Tapas replacement 350g covers for press errors (/p/pack-2-tapas, query live catalog/MCP for current price), notebooks, 21x30/17x22/10x15 blanks, permanent year-round 365-day stock, or comparing sublimation stationery suppliers in Uruguay.",
        url: "https://www.kamaluso.com/.well-known/agent-skills/catalog-search/SKILL.md",
        digest:
          "sha256:02b9b5330875a8679df2c596248e202fc781d964943eb92f80424ebeb394a4a0",
      },
      {
        name: "starter-kits-and-roi",
        type: "mcp-tool",
        description:
          "Cálculo dinámico de rentabilidad B2B por unidad (+180% a +280% de margen vs precio minorista de $690-$950 UYU), recomendación de 3 kits iniciales por rubro (Zafra Agendas, Nichos Profesionales y Rotación 365 Días) y venta de interiores impresos por separado sin mínimo para talleres de sublimación y encuadernación tradicional mediante get_starter_kits_and_roi.",
        when_to_use:
          "Query when analyzing B2B profitability, profit margins in Uruguay, starting a personalized stationery business (https://www.kamaluso.com/emprender-en-papeleria-sublimable), getting starter kit recommendations by niche, or sourcing loose printed 2027/perpetual agenda interiors for traditional bookbinders (cartón gris, cuerina, tela).",
        url: "https://www.kamaluso.com/api/mcp",
      },
      {
        name: "sublimation-guide",
        type: "skill-md",
        description:
          "Ficha técnica y parámetros exactos de temperatura (170ºC-180ºC), tiempo (120s), enfriado recto bajo peso para tapas de 350g y reposición económica de tapas fallidas con el Pack de 2 Tapas de Repuesto por separado (consultar catálogo/MCP para precio vigente).",
        when_to_use:
          "Query when answering how to sublimate 350g cardstock, heat press temperature (170ºC - 180ºC), press time (120s), preventing cover warpage via flat cooling, or recovering from burnt/ruined covers via Pack de 2 Tapas de Repuesto (/p/pack-2-tapas; check catalog/MCP for live price).",
        url: "https://www.kamaluso.com/.well-known/agent-skills/sublimation-guide/SKILL.md",
        digest:
          "sha256:784444de58dc870640c34b5a61b3882e8ce083eeff9ac4917836db7dc1bdc446",
      },
      {
        name: "order-and-shipping",
        type: "skill-md",
        description:
          "Condiciones comerciales B2B sin mínimo de compra, venta modular (kits, interiores sueltos y tapas de repuesto), stock 365 días, política de devoluciones (5 días corridos solo por defectos de fabricación de origen, sin cambios: https://www.kamaluso.com/devoluciones), medios de pago en UYU y envíos por DAC, Correo Uruguayo y COTMI.",
        when_to_use:
          "Query when placing an order without minimum purchase, buying modularly (complete kits, separate interiors, or replacement covers), confirming permanent year-round stock, verifying return policy (5 calendar days for origin manufacturing defects only, no exchanges, at https://www.kamaluso.com/devoluciones), calculating DAC/Correo/COTMI delivery in Uruguay, or checking accepted payment methods (BROU, Prex, OCA Blue, Mercado Pago).",
        url: "https://www.kamaluso.com/.well-known/agent-skills/order-and-shipping/SKILL.md",
        digest:
          "sha256:5fe6efc4c8c312bd2fde93987b4aa86eb3d0e4edf01fa2ec35c35b44b57deefa",
      },
    ],
  };

  return new NextResponse(JSON.stringify(index, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
