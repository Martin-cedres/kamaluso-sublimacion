import { NextResponse } from "next/server";
import {
  clearCustomerOtpCookie,
  CUSTOMER_OTP_COOKIE,
  getCustomerCookieOptions,
  setCustomerSessionCookie,
  verifyCustomerOtpFromRequest,
} from "@/lib/customer-auth-server";
import { getLatestServerCustomers } from "@/lib/server-customers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      code?: string;
    } | null;

    const email = (body?.email || "").trim().toLowerCase();
    const code = typeof body?.code === "string" ? body.code : "";

    if (!email || !code) {
      return NextResponse.json(
        { error: "Ingresá tu correo y el código de 6 dígitos." },
        { status: 400 }
      );
    }

    const check = verifyCustomerOtpFromRequest(request, email, code);
    if (!check.ok) {
      const errorRes = NextResponse.json(
        { error: check.error },
        { status: check.status }
      );

      if (check.clearChallenge) {
        clearCustomerOtpCookie(errorRes);
      } else if (check.updatedChallengeToken) {
        errorRes.cookies.set(
          CUSTOMER_OTP_COOKIE,
          check.updatedChallengeToken,
          getCustomerCookieOptions(15 * 60)
        );
      }

      return errorRes;
    }

    const customers = await getLatestServerCustomers();
    const existing = customers.find(
      (c) => c.email && c.email.trim().toLowerCase() === check.email
    );

    const sessionUser = {
      email: check.email,
      name: existing?.name?.trim() || undefined,
    };

    const response = NextResponse.json({
      success: true,
      session: sessionUser,
    });

    clearCustomerOtpCookie(response);
    return setCustomerSessionCookie(response, sessionUser);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error al verificar código";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
