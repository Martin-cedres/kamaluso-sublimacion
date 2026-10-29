import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/mailer";
import { upsertServerOrder } from "@/lib/server-orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      cart,
      totalPrice,
      finalTotal,
      paymentMethodId,
      paymentMethodName,
      shippingMethodName,
      customer,
      mpPaymentInfo,
    } = body;

    const result = await sendOrderEmails({
      orderId,
      cart,
      totalPrice: Number(totalPrice) || 0,
      finalTotal: Number(finalTotal) || Number(totalPrice) || 0,
      paymentMethodId,
      paymentMethodName,
      shippingMethodName,
      customer,
      mpPaymentInfo,
    });

    if (orderId && result.success && !result.skipped) {
      try {
        await upsertServerOrder({
          id: orderId,
          emailSent: true,
          emailSentAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Aviso al marcar emailSent en orden:", err);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error general al enviar correos:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
