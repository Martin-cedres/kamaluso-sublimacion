import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const poppy = {
    protocol_version: "0.1",
    organization: {
      name: "Kamaluso Sublimación",
      domain: "kamaluso.com",
    },
    web: {},
  };

  return new NextResponse(JSON.stringify(poppy, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
