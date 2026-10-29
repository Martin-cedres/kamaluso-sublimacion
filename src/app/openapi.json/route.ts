import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "openapi.json");
  const content = fs.readFileSync(filePath, "utf-8");

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.oai.openapi+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
