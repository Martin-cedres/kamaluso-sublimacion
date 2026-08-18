import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || `product-${Date.now()}.webp`;

  try {
    const blob = await put(filename, request.body!, {
      access: "public",
      addRandomSuffix: true,
      allowOverwrite: true,
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Error en /api/upload con Vercel Blob:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
