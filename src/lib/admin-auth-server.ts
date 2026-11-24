import crypto from "crypto";
import { NextResponse } from "next/server";
import { AdminUser, isAllowedAdminEmail } from "@/lib/auth";

export const ADMIN_SESSION_COOKIE = "kamaluso_admin_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_SEC = 30 * 24 * 60 * 60;

interface SessionPayload {
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.REVALIDATION_SECRET ||
    "kamaluso-dev-secret-local"
  );
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function sha256Buffer(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

export function createAdminSessionToken(user: AdminUser): string {
  const now = Date.now();
  const payload: SessionPayload = {
    email: user.email.toLowerCase().trim(),
    name: user.name || user.email.split("@")[0],
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null
): AdminUser | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;

  try {
    const expectedSignature = signPayload(encodedPayload);
    const sigBuf = Buffer.from(signature, "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (!decoded || typeof decoded.exp !== "number" || decoded.exp <= Date.now()) {
      return null;
    }

    if (!isAllowedAdminEmail(decoded.email)) {
      return null;
    }

    return {
      email: decoded.email.toLowerCase().trim(),
      name: decoded.name || decoded.email.split("@")[0],
    };
  } catch {
    return null;
  }
}

export function verifyAdminPassword(inputPassword: string): {
  ok: boolean;
  error?: string;
  status?: number;
} {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword || !configuredPassword.trim()) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        status: 503,
        error:
          "Falta configurar ADMIN_PASSWORD en las variables de entorno de Vercel.",
      };
    }

    const devMatches = crypto.timingSafeEqual(
      sha256Buffer(inputPassword || ""),
      sha256Buffer("kamaluso-dev")
    );
    if (!devMatches) {
      return {
        ok: false,
        status: 401,
        error:
          "Contraseña incorrecta. Configurá ADMIN_PASSWORD en .env.local o usá la clave local de desarrollo.",
      };
    }
    return { ok: true };
  }

  const matches = crypto.timingSafeEqual(
    sha256Buffer(inputPassword || ""),
    sha256Buffer(configuredPassword)
  );

  if (!matches) {
    return {
      ok: false,
      status: 401,
      error: "Credenciales inválidas.",
    };
  }

  return { ok: true };
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};

  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const rawVal = part.slice(eqIdx + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(rawVal);
    } catch {
      result[key] = rawVal;
    }
  }

  return result;
}

export function getAdminSessionFromRequest(request: Request): AdminUser | null {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies[ADMIN_SESSION_COOKIE];
  return verifyAdminSessionToken(token);
}

export function getSessionCookieOptions(maxAge = SESSION_DURATION_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/**
 * Emite o renueva la cookie de sesión firmada (ventana deslizante de 30 días).
 */
export function setAdminSessionCookie(
  response: NextResponse,
  user: AdminUser
): NextResponse {
  const token = createAdminSessionToken(user);
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions());
  return response;
}

export function unauthorizedAdminResponse(): NextResponse {
  return NextResponse.json(
    { error: "No autorizado. Iniciá sesión como administrador." },
    { status: 401 }
  );
}
