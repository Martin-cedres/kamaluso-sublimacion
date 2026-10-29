import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "kamaluso-sublimacion",
      timestamp: new Date().toISOString(),
      agent_ready: true,
      protocols: ["RFC 8288", "RFC 9727", "RFC 9728", "SEP-1649", "WebMCP", "ARD"],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    }
  );
}
