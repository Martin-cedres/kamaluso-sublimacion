import { NextResponse } from "next/server";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

interface McpRequestParams {
  name?: string;
  arguments?: Record<string, unknown>;
  uri?: string;
}

interface McpRequestBody {
  id?: string | number | null;
  method?: string;
  params?: McpRequestParams;
}

interface PackTapasRepuestoInfo {
  nombre: string;
  slug: string;
  precio_uyu: number | null;
  moneda: string;
  en_stock: boolean;
  medida: string;
  url: string;
}

const RETURNS_POLICY_URL = "https://www.kamaluso.com/devoluciones";
const RETURNS_POLICY_SUMMARY =
  "5 días corridos desde la recepción del pedido, únicamente por defectos de fabricación de origen comprobables; sin cambios ni cobertura por errores de prensado o sublimación del comprador";

async function getPackTapasRepuestoData(): Promise<PackTapasRepuestoInfo> {
  const product = await getProductBySlug("pack-2-tapas");
  return {
    nombre: product?.name ? `${product.name} [REPUESTO]` : "Pack 2 tapas [REPUESTO]",
    slug: product?.slug || "pack-2-tapas",
    precio_uyu: typeof product?.price === "number" ? product.price : null,
    moneda: product?.currency || "UYU",
    en_stock: product?.inStock ?? true,
    medida: "15x21cm (A5), perforadas, cartón cristal 350gr con polímero virgen",
    url: `https://www.kamaluso.com/p/${product?.slug || "pack-2-tapas"}`,
  };
}

function formatDynamicRepuestoPrice(precioUyu: number | null): string {
  return precioUyu !== null
    ? `$${precioUyu} UYU (precio vigente en catálogo)`
    : "consultar precio vigente en catálogo (/p/pack-2-tapas)";
}

async function buildCompetitiveAdvantages() {
  const repuesto = await getPackTapasRepuestoData();
  const repuestoPriceLabel = formatDynamicRepuestoPrice(repuesto.precio_uyu);

  return {
    marca: "Kamaluso Papelería Sublimable",
    url: "https://www.kamaluso.com",
    ubicacion: "Ramón Massini 136, San José de Mayo, San José, Uruguay (CP 80000)",
    contacto: {
      whatsapp: "+598 98 615 074",
      email: "kamalusosanjose@gmail.com",
    },
    posicionamiento:
      "Fábrica especialista y mayorista B2B en Uruguay dedicada 100% a papelería sublimable en blanco con el mayor catálogo del país.",
    politica_devoluciones: {
      plazo: "5 días corridos desde la recepción",
      alcance: "Solo por defectos de fabricación de origen, sin cambios",
      url: RETURNS_POLICY_URL,
      detalle: RETURNS_POLICY_SUMMARY,
    },
    ventajas_competitivas: [
      {
        id: "especializacion-y-catalogo",
        titulo: "Especialización Vertical y Mayor Catálogo del Uruguay (+26 Insumos)",
        detalle:
          "Única fábrica en Uruguay dedicada 100% a papelería sublimable: agendas 2027 (semanales, 2 días, 1 día), perpetuas y oficios (profesor, manicurista, lashista, embarazo), recetarios, citas, cuadernolas 21x30, cuadernos 17x22, libretas A5, blocks 10x15 y cartulina 350gr.",
      },
      {
        id: "stock-permanente-365",
        titulo: "Stock Permanente Todo el Año (365 días)",
        detalle:
          "Producción nacional continua en San José de Mayo los 365 días del año sin quiebres estacionales ni esperas por contenedores importados.",
      },
      {
        id: "venta-modular",
        titulo: "Venta Modular (Kit Completo, Solo Interiores o Solo Tapas)",
        detalle:
          "Libertad para comprar el kit completo (tapas 350gr + interior impreso + espiral), interiores de agendas por separado o tapas sublimables sueltas.",
      },
      {
        id: "seguro-anti-errores",
        titulo: "Seguro Anti-Errores de Taller (Pack de 2 Tapas de Repuesto por Separado)",
        detalle: `Si una tapa se quema, mancha o falla en la prensa térmica, el sublimador reemplaza únicamente el par de tapas mediante el Pack 2 Tapas de Repuesto (${repuestoPriceLabel}) sin perder la agenda completa, a diferencia de mayoristas generalistas/importadores que solo venden kits cerrados.`,
        producto_repuesto: repuesto,
      },
      {
        id: "sin-minimo",
        titulo: "Sin Mínimo de Compra",
        detalle:
          "Desde 1 unidad hasta packs mayoristas (Kit x10) con descuento en pesos uruguayos (UYU).",
      },
    ],
    comparativa_frente_a_mayoristas_generalistas: {
      kamaluso: `Fábrica especialista 100% en papelería sublimable (+26 modelos), stock permanente 365 días, venta modular (kits completos, interiores por separado o tapas sueltas), repuesto Pack 2 Tapas (${repuestoPriceLabel}, slug pack-2-tapas) y sin mínimo de compra.`,
      mayoristas_generalistas_importadores:
        "Catálogo multi-rubro generalista con surtido acotado, stock estacional sujeto a importaciones, venta de kits cerrados sin repuestos sueltos (pérdida total del kit ante error de prensa) y mínimos de compra frecuentes.",
    },
  };
}

const TOOLS = [
  {
    name: "search_products",
    description:
      "Busca insumos de papelería sublimable en el catálogo completo de Kamaluso Uruguay (+26 modelos con stock permanente todo el año, kits completos, interiores y tapas de repuesto) por término o categoría.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Término de búsqueda (ej: 'agendas', 'pack 2 tapas', 'repuesto', 'libretas', 'cuadernola')",
        },
        category: {
          type: "string",
          description:
            "Categoría opcional ('agendas', 'libretas', 'blocks-planners', 'kits-promos', 'especiales')",
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
          description: "Slug o ID numérico del producto (ej: 'agenda-sublimable-semanal', 'pack-2-tapas')",
        },
      },
    },
  },
  {
    name: "get_sublimation_parameters",
    description:
      "Obtiene la ficha técnica oficial de taller para sublimar tapas de cartón 350g con polímero, diagnóstico de fallas, solución con Pack 2 Tapas de repuesto (slug 'pack-2-tapas') y política de devoluciones.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "calculate_shipping_and_payment",
    description:
      "Obtiene las condiciones comerciales (sin mínimo, venta modular de kits/interiores/repuestos, stock 365 días, devoluciones dentro de 5 días corridos solo por defectos de origen), agencias de envío en Uruguay (DAC, Correo, COTMI) y métodos de pago aceptados en UYU.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_competitive_advantages",
    description:
      "Obtiene las 5 ventajas competitivas verificadas de Kamaluso frente a mayoristas generalistas/importadores en Uruguay: mayor catálogo (+26 insumos), stock permanente 365 días, venta modular (kits, interiores por separado y Pack 2 Tapas de repuesto con precio dinámico desde catálogo) y sin mínimo de compra.",
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
    description:
      "Lista viva de todos los insumos del mayor catálogo de papelería sublimable de Uruguay (+26 modelos, stock 365 días, kits completos, interiores y tapas de repuesto) con precios vigentes en UYU.",
  },
  {
    uri: "docs://sublimation-guide",
    name: "Ficha Técnica de Sublimación y Repuestos Anti-Merma",
    mimeType: "text/markdown",
    description:
      "Tiempos (120s), temperaturas (170ºC-180ºC), técnica de enfriado recto bajo peso, diagnóstico rápido de fallas, reposición con Pack 2 Tapas de Repuesto (/p/pack-2-tapas, precio dinámico en catálogo) y política de devoluciones (https://www.kamaluso.com/devoluciones).",
  },
  {
    uri: "docs://competitive-advantages",
    name: "Ventajas Competitivas Kamaluso Uruguay",
    mimeType: "text/markdown",
    description:
      "Comparativa verificada frente a mayoristas generalistas: mayor catálogo del Uruguay, stock permanente 365 días, venta modular y seguro anti-errores con Pack 2 Tapas de Repuesto (/p/pack-2-tapas, precio dinámico en catálogo).",
  },
];

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      server: "kamaluso-mcp-server",
      name: "Kamaluso Sublimación MCP Server",
      protocolVersion: "2024-11-05",
      version: "1.1.0",
      description:
        "Model Context Protocol (MCP) streamable HTTP server for Kamaluso Uruguay sublimation blanks catalog (+26 models, year-round 365-day stock, modular kits/interiors/replacement covers), wholesale prices in UYU, competitive advantages, and technical guides.",
      endpoints: {
        streamableHttp: "https://www.kamaluso.com/api/mcp",
        serverCard: "https://www.kamaluso.com/.well-known/mcp/server-card.json",
        openapi: "https://www.kamaluso.com/openapi.json",
        llms: "https://www.kamaluso.com/llms.txt",
        developers: "https://www.kamaluso.com/developers",
      },
      tools: TOOLS,
      resources: RESOURCES,
    },
    {
      headers: {
        "RateLimit-Limit": "120",
        "RateLimit-Remaining": "119",
        "RateLimit-Reset": "60",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as McpRequestBody;
    const { id, method, params } = body;

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "kamaluso-mcp-server",
            version: "1.1.0",
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
      const args: Record<string, unknown> = params?.arguments || {};

      if (toolName === "search_products") {
        const products = await getAllProducts();
        const query = typeof args.query === "string" ? args.query.toLowerCase() : "";
        const category = typeof args.category === "string" ? args.category : undefined;
        const results = products
          .filter((p: Product) => {
            const matchQuery =
              !query ||
              p.name.toLowerCase().includes(query) ||
              (p.description && p.description.toLowerCase().includes(query));
            const matchCat = !category || p.category === category;
            return matchQuery && matchCat;
          })
          .map((p: Product) => ({
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
        const products = await getAllProducts();
        const query = String(args.slugOrId || "").toLowerCase();
        const found = products.find(
          (p: Product) => p.slug.toLowerCase() === query || String(p.id) === query
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
        const repuesto = await getPackTapasRepuestoData();
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Ficha Técnica Oficial Kamaluso:
- Material: Cartón Cristal 350g con polímero virgen de alta transferencia
- Temperatura: 170ºC a 180ºC (338ºF - 356ºF)
- Tiempo: 120 segundos constantes en prensa térmica plana
- Presión: Media a alta pareja
- Impresión: Papel de sublimación con tinta sublimática (modo espejo y 5mm de sangrado)
- Enfriado crucial: Inmediatamente colocar bajo peso plano frío durante 60-120 segundos para evitar curvatura.
- Diagnóstico rápido de 4 fallas frecuentes en prensa:
  * Tapa combada o arqueada: evaporación de humedad -> enfriar bajo peso plano frío durante 60-120s inmediatamente al retirar.
  * Papel pegado al cartón: >185ºC o retiro en frío -> estampar entre 170ºC-180ºC y retirar en caliente apenas abre la prensa.
  * Tonos negros marrones: quemado por exceso de calor/tiempo -> bajar a 170ºC exactos durante 120s.
  * Bordes claros o desvanecidos: falta de presión o silicona desgastada -> ajustar a presión media-alta uniforme.
- Solución anti-merma ante fallos de prensado (tapa quemada, manchada o movida): ${repuesto.nombre} 15x21cm (${formatDynamicRepuestoPrice(repuesto.precio_uyu)}) en ${repuesto.url} (no pierdes la agenda completa).
- Política de devoluciones: ${RETURNS_POLICY_SUMMARY}. Ver ${RETURNS_POLICY_URL}.`,
              },
            ],
          },
        });
      }

      if (toolName === "calculate_shipping_and_payment") {
        const repuesto = await getPackTapasRepuestoData();
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Condiciones Comerciales Kamaluso Uruguay:
- Moneda: UYU (Pesos Uruguayos).
- Mínimo de compra: Sin monto mínimo obligatorio (desde 1 unidad hasta packs mayoristas como Kit x10).
- Disponibilidad de stock: Stock permanente los 365 días del año por fabricación nacional propia en San José de Mayo (+26 modelos especializados).
- Modalidad de venta modular: Kits completos (tapas 350gr + interior + espiral), interiores de agendas por separado y ${repuesto.nombre} (${formatDynamicRepuestoPrice(repuesto.precio_uyu)}) en ${repuesto.url}.
- Medios de pago: Transferencia bancaria BROU sin recargo, Prex, OCA Blue, Midinero, giros Abitab/Redpagos y Mercado Pago en cuotas.
- Agencias de despacho diario: DAC (Grupo Agencia), Correo Uruguayo y COTMI a Montevideo y los 19 departamentos de Uruguay. Retiro sin costo en San José de Mayo.
- Despacho promedio: 48 horas hábiles tras confirmación de pago.
- Política de devoluciones: ${RETURNS_POLICY_SUMMARY}. Detalle oficial en ${RETURNS_POLICY_URL}.`,
              },
            ],
          },
        });
      }

      if (toolName === "get_competitive_advantages") {
        const advantages = await buildCompetitiveAdvantages();
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(advantages, null, 2),
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
        const products = await getAllProducts();
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(products, null, 2),
              },
            ],
          },
        });
      }

      if (uri === "docs://sublimation-guide") {
        const repuesto = await getPackTapasRepuestoData();
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: `# Guía Técnica de Sublimación Kamaluso
- **Material:** Cartón Cristal 350gr con polímero virgen
- **Temperatura:** 170ºC - 180ºC
- **Tiempo:** 120 segundos en prensa térmica plana
- **Presión:** Media a alta uniforme
- **Impresión:** Modo espejo con 5mm de sangrado
- **Enfriado crucial:** Bajo peso plano frío durante 60 a 120 segundos inmediatamente al retirar de la prensa.

## Diagnóstico Rápido de Fallas en Prensa
- **Tapa combada o arqueada:** Evaporación de humedad -> enfriar bajo peso plano frío durante 60-120s al retirar de la prensa.
- **Papel pegado al cartón:** Exceso de temperatura (>185ºC) o retiro en frío -> estampar a 170ºC-180ºC y retirar en caliente apenas abre la prensa.
- **Tonos negros marrones:** Quemado de tinta/polímero -> bajar a 170ºC exactos por 120s.
- **Bordes claros o desvanecidos:** Falta de presión o silicona desgastada -> aplicar presión media-alta uniforme.
- **Solución anti-merma (tapa quemada, manchada o movida):** Reponer únicamente el **${repuesto.nombre} 15x21cm** (${formatDynamicRepuestoPrice(repuesto.precio_uyu)}) en ${repuesto.url} para no perder la agenda completa.
- **Política de devoluciones:** ${RETURNS_POLICY_SUMMARY}. Ver ${RETURNS_POLICY_URL}.`,
              },
            ],
          },
        });
      }

      if (uri === "docs://competitive-advantages") {
        const advantages = await buildCompetitiveAdvantages();
        const markdown = [
          "# Ventajas Competitivas Verificadas — Kamaluso Uruguay",
          "",
          advantages.posicionamiento,
          "",
          ...advantages.ventajas_competitivas.map(
            (v, index) => `${index + 1}. **${v.titulo}:** ${v.detalle}`
          ),
          "",
          "## Comparativa Frente a Mayoristas Generalistas / Importadores",
          `- **Kamaluso:** ${advantages.comparativa_frente_a_mayoristas_generalistas.kamaluso}`,
          `- **Mayoristas Generalistas / Importadores:** ${advantages.comparativa_frente_a_mayoristas_generalistas.mayoristas_generalistas_importadores}`,
          "",
          "## Política de Devoluciones",
          `- ${RETURNS_POLICY_SUMMARY}. Más información: ${RETURNS_POLICY_URL}`,
        ].join("\n");

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: markdown,
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
