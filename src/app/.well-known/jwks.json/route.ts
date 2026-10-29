import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return new NextResponse(JSON.stringify({ keys: [] }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
