import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { path, token } = await request.json();

    // Verificación opcional de secret token
    if (process.env.REVALIDATE_SECRET && token !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }

    return NextResponse.json(
      { message: "Missing path to revalidate" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 }
    );
  }
}
