import { NextResponse } from "next/server";

export async function POST() {
  const token = `kml_agt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return NextResponse.json(
    {
      access_token: token,
      token_type: "Bearer",
      expires_in: 86400,
      scope: "read:products read:catalog create:orders read:resources",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}
