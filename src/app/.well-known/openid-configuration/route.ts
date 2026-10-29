import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const oidc = {
    issuer: "https://www.kamaluso.com",
    authorization_endpoint: "https://www.kamaluso.com/oauth/authorize",
    token_endpoint: "https://www.kamaluso.com/api/agent/token",
    jwks_uri: "https://www.kamaluso.com/.well-known/jwks.json",
    response_types_supported: ["code", "token", "id_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email", "read:products", "create:orders"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
  };

  return new NextResponse(JSON.stringify(oidc, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
