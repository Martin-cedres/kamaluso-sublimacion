import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: "https://www.kamaluso.com/api",
        "service-desc": [
          {
            href: "https://www.kamaluso.com/openapi.json",
            type: "application/vnd.oai.openapi+json",
          },
        ],
        "service-doc": [
          {
            href: "https://www.kamaluso.com/llms.txt",
            type: "text/markdown",
          },
        ],
        status: [
          {
            href: "https://www.kamaluso.com/api/health",
            type: "application/json",
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
