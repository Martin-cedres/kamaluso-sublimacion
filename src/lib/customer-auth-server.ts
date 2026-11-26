import crypto from "crypto";
import { NextResponse } from "next/server";

export const CUSTOMER_SESSION_COOKIE = "kamaluso_customer_session";
export const CUSTOMER_OTP_COOKIE = "kamaluso_customer_otp";

// Sesión persistente de 180 días (6 meses) con ventana deslizante en cada visita
export const CUSTOMER_SESSION_DURATION_SEC = 180 * 24 * 60 * 60;
const CUSTOMER_SESSION_DURATION_MS = CUSTOMER_SESSION_DURATION_SEC * 1000;

// Código OTP de 6 dígitos válido por 15 minutos
const OTP_DURATION_SEC = 15 * 60;
const OTP_DURATION_MS = OTP_DURATION_SEC * 1000;
const OTP_RESEND_COOLDOWN_MS = 45 * 1000;
const OTP_MAX_ATTEMPTS = 5;

export interface CustomerSession {
  email: string;
  name?: string;
}

interface CustomerSessionPayload {
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

interface OtpChallengePayload {
  email: string;
  otpHash: string;
  iat: number;
  exp: number;
  attempts: number;
}

function getSigningSecret(): string {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.REVALIDATION_SECRET ||
    "kamaluso-customer-dev-secret-local"
  );
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function verifySignedToken<T>(token: string | undefined | null): T | null {
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

    return JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as T;
  } catch {
    return null;
  }
}

function createSignedToken(payload: object): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function hashOtpCode(email: string, code: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(`${email.toLowerCase().trim()}:${code.trim()}`)
    .digest("hex");
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

export function getCustomerCookieOptions(maxAge = CUSTOMER_SESSION_DURATION_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function createCustomerSessionToken(user: CustomerSession): string {
  const now = Date.now();
  const payload: CustomerSessionPayload = {
    email: user.email.toLowerCase().trim(),
    name: user.name?.trim() || undefined,
    iat: now,
    exp: now + CUSTOMER_SESSION_DURATION_MS,
  };
  return createSignedToken(payload);
}

export function verifyCustomerSessionToken(
  token: string | undefined | null
): CustomerSession | null {
  const decoded = verifySignedToken<CustomerSessionPayload>(token);
  if (
    !decoded ||
    typeof decoded.email !== "string" ||
    !decoded.email.includes("@") ||
    typeof decoded.exp !== "number" ||
    decoded.exp <= Date.now()
  ) {
    return null;
  }

  return {
    email: decoded.email.toLowerCase().trim(),
    name: decoded.name?.trim() || undefined,
  };
}

export function getCustomerSessionFromRequest(
  request: Request
): CustomerSession | null {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies[CUSTOMER_SESSION_COOKIE];
  return verifyCustomerSessionToken(token);
}

/**
 * Emite o renueva la cookie de sesión de cliente (ventana deslizante de 180 días).
 */
export function setCustomerSessionCookie(
  response: NextResponse,
  user: CustomerSession
): NextResponse {
  const token = createCustomerSessionToken(user);
  response.cookies.set(
    CUSTOMER_SESSION_COOKIE,
    token,
    getCustomerCookieOptions(CUSTOMER_SESSION_DURATION_SEC)
  );
  return response;
}

export function clearCustomerSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", getCustomerCookieOptions(0));
  return response;
}

export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function checkOtpRequestCooldown(
  request: Request,
  email: string
): { allowed: boolean; waitSeconds: number } {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const existing = verifySignedToken<OtpChallengePayload>(
    cookies[CUSTOMER_OTP_COOKIE]
  );
  if (!existing) return { allowed: true, waitSeconds: 0 };

  const normalizedEmail = email.toLowerCase().trim();
  const elapsed = Date.now() - existing.iat;
  if (
    existing.email === normalizedEmail &&
    existing.exp > Date.now() &&
    elapsed < OTP_RESEND_COOLDOWN_MS
  ) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000),
    };
  }

  return { allowed: true, waitSeconds: 0 };
}

export function setCustomerOtpCookie(
  response: NextResponse,
  email: string,
  code: string
): NextResponse {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const payload: OtpChallengePayload = {
    email: normalizedEmail,
    otpHash: hashOtpCode(normalizedEmail, code),
    iat: now,
    exp: now + OTP_DURATION_MS,
    attempts: 0,
  };
  response.cookies.set(
    CUSTOMER_OTP_COOKIE,
    createSignedToken(payload),
    getCustomerCookieOptions(OTP_DURATION_SEC)
  );
  return response;
}

export function clearCustomerOtpCookie(response: NextResponse): NextResponse {
  response.cookies.set(CUSTOMER_OTP_COOKIE, "", getCustomerCookieOptions(0));
  return response;
}

export type VerifyOtpResult =
  | { ok: true; email: string }
  | {
      ok: false;
      error: string;
      status: number;
      updatedChallengeToken?: string;
      clearChallenge?: boolean;
    };

export function verifyCustomerOtpFromRequest(
  request: Request,
  email: string,
  inputCode: string
): VerifyOtpResult {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const challenge = verifySignedToken<OtpChallengePayload>(
    cookies[CUSTOMER_OTP_COOKIE]
  );

  if (!challenge) {
    return {
      ok: false,
      status: 400,
      error: "El código venció o no fue solicitado. Pedí un código nuevo.",
      clearChallenge: true,
    };
  }

  if (challenge.exp <= Date.now()) {
    return {
      ok: false,
      status: 400,
      error: "El código de 6 dígitos venció. Solicitá uno nuevo.",
      clearChallenge: true,
    };
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (challenge.email !== normalizedEmail) {
    return {
      ok: false,
      status: 400,
      error: "El correo no coincide con el código solicitado.",
    };
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      ok: false,
      status: 429,
      error: "Demasiados intentos fallidos. Solicitá un nuevo código.",
      clearChallenge: true,
    };
  }

  const cleanCode = (inputCode || "").replace(/\D/g, "");
  if (cleanCode.length !== 6) {
    return {
      ok: false,
      status: 400,
      error: "Ingresá los 6 dígitos numéricos del código.",
    };
  }

  const expectedHash = Buffer.from(challenge.otpHash, "hex");
  const candidateHash = Buffer.from(hashOtpCode(normalizedEmail, cleanCode), "hex");

  const matches =
    expectedHash.length === candidateHash.length &&
    crypto.timingSafeEqual(expectedHash, candidateHash);

  if (!matches) {
    const nextAttempts = challenge.attempts + 1;
    if (nextAttempts >= OTP_MAX_ATTEMPTS) {
      return {
        ok: false,
        status: 429,
        error: "Código incorrecto. Se agotaron los intentos; solicitá uno nuevo.",
        clearChallenge: true,
      };
    }

    const remainingSec = Math.max(
      1,
      Math.ceil((challenge.exp - Date.now()) / 1000)
    );
    const updatedPayload: OtpChallengePayload = {
      ...challenge,
      attempts: nextAttempts,
    };
    return {
      ok: false,
      status: 401,
      error: `Código incorrecto. Te quedan ${OTP_MAX_ATTEMPTS - nextAttempts} intentos.`,
      updatedChallengeToken: createSignedToken(updatedPayload),
      clearChallenge: remainingSec <= 0,
    };
  }

  return { ok: true, email: normalizedEmail };
}

export function unauthorizedCustomerResponse(): NextResponse {
  return NextResponse.json(
    { error: "Sesión de cliente no iniciada o vencida." },
    { status: 401 }
  );
}
