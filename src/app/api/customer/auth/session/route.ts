import { NextResponse } from "next/server";
import {
  getCustomerSessionFromRequest,
  setCustomerSessionCookie,
} from "@/lib/customer-auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getCustomerSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { authenticated: false, session: null },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }

  const response = NextResponse.json(
    { authenticated: true, session },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );

  // Renovación automática (ventana deslizante de 180 días)
  return setCustomerSessionCookie(response, session);
}
