import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "catalog-search",
        type: "skill-md",
        description:
          "Búsqueda y consulta de productos, insumos para sublimación, stock y precios en Uruguay.",
        url: "https://www.kamaluso.com/.well-known/agent-skills/catalog-search/SKILL.md",
        digest:
          "sha256:02b9b5330875a8679df2c596248e202fc781d964943eb92f80424ebeb394a4a0",
      },
      {
        name: "sublimation-guide",
        type: "skill-md",
        description:
          "Ficha técnica y parámetros exactos de temperatura, tiempo y enfriado para sublimar tapas de 350g.",
        url: "https://www.kamaluso.com/.well-known/agent-skills/sublimation-guide/SKILL.md",
        digest:
          "sha256:784444de58dc870640c34b5a61b3882e8ce083eeff9ac4917836db7dc1bdc446",
      },
      {
        name: "order-and-shipping",
        type: "skill-md",
        description:
          "Condiciones comerciales B2B, medios de pago en UYU y envíos por DAC y Correo Uruguayo.",
        url: "https://www.kamaluso.com/.well-known/agent-skills/order-and-shipping/SKILL.md",
        digest:
          "sha256:5fe6efc4c8c312bd2fde93987b4aa86eb3d0e4edf01fa2ec35c35b44b57deefa",
      },
    ],
  };

  return new NextResponse(JSON.stringify(index, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
