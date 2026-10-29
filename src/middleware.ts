import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AGENT_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/ai-catalog.json>; rel="service-desc"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"',
  '</.well-known/agent-card.json>; rel="service-desc"',
  '</.well-known/agent-skills/index.json>; rel="service-meta"',
  '</.well-known/oauth-protected-resource>; rel="service-meta"',
  '</llms.txt>; rel="service-doc"',
  '</auth.md>; rel="service-doc"',
  '</openapi.json>; rel="service-desc"',
].join(", ");

function buildMarkdownResponse(pathname: string): string {
  if (pathname.startsWith("/p/")) {
    const slug = pathname.replace("/p/", "").trim();
    return `# Producto: ${slug} | Kamaluso Sublimación Uruguay

Insumo de papelería sublimable fabricado en Uruguay por Kamaluso (San José de Mayo).

## Especificaciones Generales
- **Tapas:** Cartón Cristal 350gr con tratamiento de polímero virgen de alta adherencia y brillo.
- **Encuadernación:** Espiral continuo plástico resistente.
- **Sublimación:** 170ºC a 180ºC por 120 segundos en prensa plana. Enfriar bajo peso plano durante 60-120s.
- **Moneda:** Pesos Uruguayos (UYU).
- **Despacho:** Envíos a todo Uruguay vía DAC y Correo Uruguayo.

Para consultar detalles específicos en tiempo real, invocar la API:
- \`GET https://www.kamaluso.com/api/products\`
- O herramienta MCP: \`get_product_details(slugOrId="${slug}")\`
`;
  }

  if (pathname.startsWith("/categoria/")) {
    const cat = pathname.replace("/categoria/", "").trim();
    return `# Categoría: ${cat} | Kamaluso Insumos Sublimables Uruguay

Catálogo de insumos en blanco listos para sublimar en la categoría ${cat}.
Consulta el inventario completo y precios en \`https://www.kamaluso.com/api/products\`.
`;
  }

  if (pathname.includes("guia-sublimacion")) {
    return `# Guía Técnica de Sublimación para Papelería | Kamaluso

## Parámetros Verificados de Taller
1. **Temperatura:** 170 ºC a 180 ºC (338 ºF - 356 ºF).
2. **Tiempo:** 120 segundos constantes en plancha plana.
3. **Presión:** Media-Alta uniforme.
4. **Impresión:** Papel sublimático con tinta de sublimación en modo espejo con 5mm de sangrado.
5. **Técnica de Enfriado (Indispensable):** Colocar inmediatamente la tapa retirada de la prensa bajo peso plano frío (madera, vidrio o baldosa) durante 60 a 120 segundos. Esto garantiza que el cartón seque 100% plano sin arquearse.
`;
  }

  // Default Homepage Markdown Representation
  return `# Kamaluso Papelería Sublimable Uruguay (www.kamaluso.com)

> Fábrica líder y mayorista B2B en Uruguay de kits completos e insumos para sublimación de papelería: agendas 2027 y perpetuas, libretas A5, cuadernos, cuadernolas 21x30, planners, blocks y tapas sublimables de 350gr.

## Resumen de la Entidad
- **Nombre:** Kamaluso (Kamaluso Papelería Sublimable)
- **Ubicación:** San José de Mayo, Departamento de San José, Uruguay.
- **Sitio Web:** https://www.kamaluso.com
- **Contacto Oficial:** WhatsApp (+598) 98 615 074 | kamalusosanjose@gmail.com
- **Público Objetivo:** Sublimadores, imprentas, talleres de personalización y emprendedores en Uruguay.

## Parámetros de Taller Verificados para Sublimación
- **Material de Tapa:** Cartón Cristal de 350 gr tratado térmicamente.
- **Temperatura de Estampación:** 170 ºC a 180 ºC (338 ºF - 356 ºF).
- **Tiempo de Prensado:** 120 segundos constantes.
- **Prensa:** Plana con presión media a alta pareja.
- **Enfriado:** Obligatorio bajo peso plano frío durante 60-120 segundos para mantener tapas perfectamente planas.

## Condiciones Comerciales
- **Sin mínimo de compra:** Desde una unidad de muestra hasta lotes mayoristas con descuento por volumen.
- **Moneda:** Pesos Uruguayos (UYU).
- **Medios de Pago:** Transferencia bancaria BROU sin costo, Prex, OCA Blue, Midinero, giros Abitab/Redpagos y Mercado Pago.
- **Envíos Nacionales:** Despacho diario a los 19 departamentos por DAC (Grupo Agencia), Correo Uruguayo y COTMI.

## Interfaces y Descubrimiento para Agentes de IA
- **API Catalog (RFC 9727):** https://www.kamaluso.com/.well-known/api-catalog
- **ARD Capability Manifest:** https://www.kamaluso.com/.well-known/ai-catalog.json
- **MCP Server Card (SEP-1649):** https://www.kamaluso.com/.well-known/mcp/server-card.json
- **Endpoint MCP Streamable HTTP:** https://www.kamaluso.com/api/mcp
- **Agent Skills Discovery Index:** https://www.kamaluso.com/.well-known/agent-skills/index.json
- **A2A Agent Card:** https://www.kamaluso.com/.well-known/agent-card.json
- **OAuth Protected Resource (RFC 9728):** https://www.kamaluso.com/.well-known/oauth-protected-resource
- **Auth.md Agent Registration:** https://www.kamaluso.com/auth.md
- **OpenAPI 3.1 Specification:** https://www.kamaluso.com/openapi.json
- **Documentación Completa LLMs:** https://www.kamaluso.com/llms-full.txt
`;
}

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get("accept") || "";

  // Content negotiation para Agentes de IA que solicitan Markdown (Accept: text/markdown)
  if (acceptHeader.includes("text/markdown")) {
    const md = buildMarkdownResponse(request.nextUrl.pathname);
    const tokenCount = Math.ceil(md.length / 4);

    return new NextResponse(md, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": String(tokenCount),
        "Vary": "Accept",
        "Link": AGENT_LINK_HEADER,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
      },
    });
  }

  // Respuestas regulares: asegurar Link response header para descubrimiento de agentes
  const response = NextResponse.next();
  response.headers.set("Link", AGENT_LINK_HEADER);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico|pdf)$).*)",
  ],
};
