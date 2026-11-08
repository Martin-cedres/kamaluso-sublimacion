import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function problemNotFound(pathname: string) {
  return NextResponse.json(
    {
      type: "https://www.kamaluso.com/docs/errors/not-found",
      title: "API Endpoint Not Found",
      status: 404,
      code: "not_found",
      detail: `The endpoint '${pathname}' was not found on Kamaluso API.`,
      resolution: "Consult the OpenAPI 3.1 specification at https://www.kamaluso.com/openapi.json or developer docs at https://www.kamaluso.com/developers.",
      documentation_url: "https://www.kamaluso.com/developers",
    },
    {
      status: 404,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
        "RateLimit-Limit": "120",
        "RateLimit-Remaining": "119",
        "RateLimit-Reset": "60",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return problemNotFound(url.pathname);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  return problemNotFound(url.pathname);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  return problemNotFound(url.pathname);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  return problemNotFound(url.pathname);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    },
  });
}
