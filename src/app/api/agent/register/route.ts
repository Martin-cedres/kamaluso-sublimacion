import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json(
      {
        status: "registered",
        agent_id: agentId,
        identity_type: body.identity_type || "anonymous",
        token_endpoint: "https://www.kamaluso.com/api/agent/token",
        claim_uri: "https://www.kamaluso.com/api/agent/claim",
        message: "Agente registrado exitosamente en Kamaluso Sublimación.",
      },
      {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
