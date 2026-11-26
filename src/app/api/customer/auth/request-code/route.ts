import { NextResponse } from "next/server";
import {
  checkOtpRequestCooldown,
  generateSixDigitOtp,
  setCustomerOtpCookie,
} from "@/lib/customer-auth-server";
import { sendCustomerOtpEmail } from "@/lib/mailer";
import { getLatestServerCustomers } from "@/lib/server-customers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
    } | null;

    const email = (body?.email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 }
      );
    }

    const cooldown = checkOtpRequestCooldown(request, email);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: `Esperá ${cooldown.waitSeconds} segundos antes de pedir otro código.`,
          waitSeconds: cooldown.waitSeconds,
        },
        { status: 429 }
      );
    }

    const customers = await getLatestServerCustomers();
    const existing = customers.find(
      (c) => c.email && c.email.trim().toLowerCase() === email
    );

    const code = generateSixDigitOtp();
    const mailResult = await sendCustomerOtpEmail(email, code, existing?.name);

    if (!mailResult.success) {
      return NextResponse.json(
        {
          error:
            mailResult.error ||
            "No pudimos enviar el código en este momento. Probá nuevamente.",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Código enviado a tu correo.",
    });

    return setCustomerOtpCookie(response, email, code);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error al solicitar código";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
