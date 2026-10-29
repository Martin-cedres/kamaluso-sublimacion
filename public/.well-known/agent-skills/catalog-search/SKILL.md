# Skill: Búsqueda de Insumos y Catálogo Kamaluso

## Descripción
Permite a los agentes de IA consultar el catálogo actualizado de insumos de papelería sublimable de Kamaluso en Uruguay, incluyendo precios en UYU, stock y descripciones.

## Capacidades
- Búsqueda por término: agendas, libretas, cuadernos, planners, tapas sublimables 350g, espirales plásticos.
- Consulta de precios unitarios y descuentos mayoristas.
- Formatos disponibles: A5 (15x21 cm), Cuaderno (17x22 cm), Cuadernola A4 (21x30 cm), Mini blocks (10x15 cm).

## Endpoint de Consulta
- Endpoint REST: `GET https://www.kamaluso.com/api/products`
- MCP Tool: `search_products(query, category)`
- WebMCP: `document.modelContext.registerTool({ name: "searchProducts", ... })`
