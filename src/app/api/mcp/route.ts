import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS } from "@/lib/products";

export const dynamic = "force-dynamic";

const TOOLS = [
  {
    name: "search_products",
    description: "Busca insumos de papelería sublimable en Kamaluso Uruguay por término o categoría.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda (ej: 'agendas', 'espirales', 'tapas 350g', 'libretas')",
        },
        category: {
          type: "string",
          description: "Categoría opcional ('agendas', 'libretas', 'blocks-planners', 'kits-promos')",
        },
      },
    },
  },
  {
    name: "get_product_details",
    description: "Obtiene el detalle completo de un producto por su slug o ID.",
    inputSchema: {
      type: "object",
      required: ["slugOrId"],
      properties: {
        slugOrId: {
          type: "string",
          description: "Slug o ID numérico del producto (ej: 'agenda-semanal-2027')",
        },
      },
    },
  },
  {
    name: "get_sublimation_parameters",
    description: "Obtiene la ficha técnica oficial de taller para sublimar tapas de cartón 350g con polímero.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "calculate_shipping_and_payment",
    description: "Obtiene las agencias de envío en Uruguay (DAC, Correo) y métodos de pago aceptados en UYU.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

const RESOURCES = [
  {
    uri: "catalog://products",
    name: "Catálogo Completo de Productos",
    mimeType: "application/json",
    description: "Lista de todos los insumos de papelería sublimable con precios en UYU.",
  },
  {
    uri: "docs://sublimation-guide",
    name: "Ficha Técnica de Sublimación",
    mimeType: "text/markdown",
    description: "Tiempos, temperaturas y técnica de enfriado recto bajo peso.",
  },
];

export async function GET() {
  return NextResponse.json({
    status: "ok",
    server: "kamaluso-mcp-server",
    protocolVersion: "2024-11-05",
    tools: TOOLS.length,
    resources: RESOURCES.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, method, params } = body;

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "kamaluso-mcp-server",
            version: "1.0.0",
          },
          capabilities: {
            tools: {},
            resources: {},
          },
        },
      });
    }

    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOLS,
        },
      });
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === "search_products") {
        const query = (args.query || "").toLowerCase();
        const category = args.category;
        const results = INITIAL_PRODUCTS.filter((p) => {
          const matchQuery =
            !query ||
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query));
          const matchCat = !category || p.category === category;
          return matchQuery && matchCat;
        }).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          category: p.category,
          inStock: p.inStock,
          url: `https://www.kamaluso.com/p/${p.slug}`,
        }));

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(results.slice(0, 15), null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "get_product_details") {
        const query = String(args.slugOrId || "").toLowerCase();
        const found = INITIAL_PRODUCTS.find(
          (p) => p.slug.toLowerCase() === query || String(p.id) === query
        );

        if (!found) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              isError: true,
              content: [{ type: "text", text: `Producto no encontrado: ${query}` }],
            },
          });
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(found, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "get_sublimation_parameters") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Ficha Técnica Oficial Kamaluso:
- Material: Cartón Cristal 350g con polímero termoplástico
- Temperatura: 170ºC a 180ºC (338ºF - 356ºF)
- Tiempo: 120 segundos constantes en prensa térmica plana
- Presión: Media a alta pareja
- Impresión: Papel de sublimación con tinta sublimática (modo espejo)
- Enfriado crucial: Inmediatamente colocar bajo peso plano frío durante 60-120 segundos para evitar curvatura.`,
              },
            ],
          },
        });
      }

      if (toolName === "calculate_shipping_and_payment") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Condiciones Comerciales Kamaluso Uruguay:
- Moneda: UYU (Pesos Uruguayos)
- Sin monto mínimo de compra.
- Medios de pago: Transferencia bancaria BROU, Prex, OCA Blue, Midinero, giros Abitab/Redpagos y Mercado Pago.
- Agencias de despacho diario: DAC (Grupo Agencia), Correo Uruguayo y COTMI a todo Uruguay.
- Despacho promedio: 48 horas hábiles.`,
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool desconocido: ${toolName}` },
      });
    }

    if (method === "resources/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          resources: RESOURCES,
        },
      });
    }

    if (method === "resources/read") {
      const uri = params?.uri;
      if (uri === "catalog://products") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(INITIAL_PRODUCTS, null, 2),
              },
            ],
          },
        });
      }

      if (uri === "docs://sublimation-guide") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: "# Guía Técnica de Sublimación Kamaluso\n170ºC por 120s en prensa plana, enfriado bajo peso plano.",
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: `Resource desconocido: ${uri}` },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Método desconocido: ${method}` },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message } },
      { status: 500 }
    );
  }
}
