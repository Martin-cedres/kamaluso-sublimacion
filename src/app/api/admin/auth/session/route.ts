import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAdminSessionFromRequest(request);
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { headers });
  }

  return NextResponse.json({ authenticated: true, user }, { headers });
}
