import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: "Kamaluso Sublimación Uruguay",
      identifier: "did:web:kamaluso.com",
    },
    entries: [
      {
        identifier: "urn:air:kamaluso.com:mcp:server-card",
        displayName: "Kamaluso MCP Server",
        type: "application/mcp-server-card+json",
        url: "https://www.kamaluso.com/.well-known/mcp/server-card.json",
        representativeQueries: [
          "comprar interiores de agendas para sublimar por separado uruguay",
          "tapas sublimables de repuesto 15x21cm si se quema al estampar",
          "mayor catalogo de papeleria sublimable en uruguay stock todo el ano",
          "precio por mayor tapas sublimables 350g sin minimo de compra",
          "tiempos y temperatura para sublimar libretas 170C 120s",
          "envios de insumos para sublimacion por dac todo uruguay",
        ],
      },
      {
        identifier: "urn:air:kamaluso.com:api:openapi",
        displayName: "Kamaluso REST API",
        type: "application/vnd.oai.openapi+json",
        url: "https://www.kamaluso.com/openapi.json",
        representativeQueries: [
          "buscar productos mayor catalogo papeleria sublimable uruguay",
          "consultar stock permanente 365 dias y precios en pesos uruguayos",
          "pack 2 tapas repuesto 20 pesos uruguayos agenda sublimable",
          "cotizar pedido mayorista o unitario papeleria sublimacion sin minimo",
        ],
      },
      {
        identifier: "urn:air:kamaluso.com:skills:agent-skills",
        displayName: "Kamaluso Agent Skills Index",
        type: "application/json",
        url: "https://www.kamaluso.com/.well-known/agent-skills/index.json",
        representativeQueries: [
          "habilidades de agente para papeleria sublimable uruguay",
          "ficha tecnica parametros de taller estampacion y repuestos anti merma",
          "venta modular kits completos interiores sueltos y tapas de repuesto",
          "catalogo completo de insumos uruguay b2b 26 modelos",
        ],
      },
      {
        identifier: "urn:air:kamaluso.com:agent:agent-card",
        displayName: "Kamaluso A2A Agent Card",
        type: "application/json",
        url: "https://www.kamaluso.com/.well-known/agent-card.json",
        representativeQueries: [
          "agente de atencion y cotizaciones kamaluso uruguay",
          "comparativa proveedor especializado papeleria sublimable uruguay",
          "comunicacion agente a agente para compras b2b y reposicion de tapas",
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
