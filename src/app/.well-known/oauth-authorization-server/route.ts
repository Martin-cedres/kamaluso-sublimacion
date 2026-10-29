import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const metadata = {
    issuer: "https://www.kamaluso.com",
    authorization_endpoint: "https://www.kamaluso.com/oauth/authorize",
    token_endpoint: "https://www.kamaluso.com/api/agent/token",
    registration_endpoint: "https://www.kamaluso.com/api/agent/register",
    jwks_uri: "https://www.kamaluso.com/.well-known/jwks.json",
    response_types_supported: ["code", "token"],
    grant_types_supported: [
      "client_credentials",
      "authorization_code",
      "urn:ietf:params:oauth:grant-type:token-exchange",
    ],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
    scopes_supported: [
      "read:products",
      "read:catalog",
      "create:orders",
      "read:resources",
    ],
    agent_auth: {
      skill:
        "https://www.kamaluso.com/.well-known/agent-skills/auth-md/SKILL.md",
      register_uri: "https://www.kamaluso.com/api/agent/register",
      identity_types_supported: ["anonymous", "identity_assertion"],
      anonymous: {
        credential_types_supported: ["bearer_token"],
        claim_uri: "https://www.kamaluso.com/api/agent/claim",
      },
      identity_assertion: {
        assertion_types_supported: [
          "urn:ietf:params:oauth:token-type:id-jag",
          "verified_email",
        ],
        credential_types_supported: ["bearer_token"],
        claim_uri: "https://www.kamaluso.com/api/agent/claim",
      },
    },
  };

  return new NextResponse(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
