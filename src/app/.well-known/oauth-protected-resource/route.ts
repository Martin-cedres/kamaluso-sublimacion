import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const prm = {
    resource: "https://www.kamaluso.com",
    authorization_servers: ["https://www.kamaluso.com"],
    scopes_supported: [
      "read:products",
      "read:catalog",
      "create:orders",
      "read:resources",
    ],
    bearer_methods_supported: ["header"],
  };

  return new NextResponse(JSON.stringify(prm, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
