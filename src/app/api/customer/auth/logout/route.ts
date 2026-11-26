import { NextResponse } from "next/server";
import { clearCustomerSessionCookie } from "@/lib/customer-auth-server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearCustomerSessionCookie(response);
}
