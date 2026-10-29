import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const serverCard = {
    $schema: "https://modelcontextprotocol.io/schemas/server-card/v1.json",
    serverInfo: {
      name: "kamaluso-mcp-server",
      version: "1.0.0",
      title: "Kamaluso Sublimación MCP Server",
      description:
        "Servidor MCP oficial para consulta de catálogo, precios en UYU, stock y parámetros de taller de Kamaluso en Uruguay.",
    },
    endpoint: "https://www.kamaluso.com/api/mcp",
    transport: {
      type: "streamable-http",
      url: "https://www.kamaluso.com/api/mcp",
    },
    capabilities: {
      tools: {
        list: true,
      },
      resources: {
        list: true,
      },
      prompts: {
        list: false,
      },
    },
  };

  return new NextResponse(JSON.stringify(serverCard, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
