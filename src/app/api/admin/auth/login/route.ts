import { NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/auth";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getSessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/admin-auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    const email = (body?.email || "").trim().toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Ingresá correo y contraseña." },
        { status: 400 }
      );
    }

    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 403 }
      );
    }

    const pwCheck = verifyAdminPassword(password);
    if (!pwCheck.ok) {
      return NextResponse.json(
        { error: pwCheck.error || "Credenciales inválidas." },
        { status: pwCheck.status || 401 }
      );
    }

    const user = {
      email,
      name: email.split("@")[0],
    };

    const token = createAdminSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      token,
      getSessionCookieOptions()
    );

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error al iniciar sesión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
