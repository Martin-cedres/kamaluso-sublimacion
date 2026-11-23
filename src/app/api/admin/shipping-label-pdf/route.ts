import { NextResponse } from "next/server";
import {
  getAdminSessionFromRequest,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth-server";
import { generateShippingLabelPDF } from "@/lib/pdf/generateShippingLabelPDF";
import {
  LabelColorMode,
  LabelDeliveryType,
  LabelPaperFormat,
  ShippingLabelPDFData,
} from "@/lib/shippingLabelUtils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizePaperFormat(value?: string): LabelPaperFormat {
  return value === "thermal100x150" ? "thermal100x150" : "a6";
}

function normalizeColorMode(value?: string): LabelColorMode {
  return value === "bw" ? "bw" : "color";
}

function normalizeDeliveryType(value?: string): LabelDeliveryType {
  if (value === "local" || value === "domicilio") return value;
  return "agencia";
}

function buildPdfResponse(pdfBuffer: Buffer, data: ShippingLabelPDFData): NextResponse {
  const formatTag = data.paperFormat === "thermal100x150" ? "100x150" : "A6";
  const safeOrder = (data.orderNumber || "Kamaluso").replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `Etiqueta-${formatTag}-${safeOrder}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }
  try {
    const body = (await request.json()) as Partial<ShippingLabelPDFData>;
    const labelData: ShippingLabelPDFData = {
      recipientName: (body.recipientName || "").trim(),
      recipientPhone: (body.recipientPhone || "").trim(),
      recipientDept: (body.recipientDept || "Montevideo").trim(),
      recipientCity: (body.recipientCity || "").trim(),
      recipientAddress: (body.recipientAddress || "").trim(),
      shippingAgency: (body.shippingAgency || "DAC").trim(),
      deliveryType: normalizeDeliveryType(body.deliveryType),
      observations: body.observations?.trim() || undefined,
      rutInfo: body.rutInfo?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      orderNumber: (body.orderNumber || `KAM-${Date.now().toString().slice(-6)}`).trim(),
      senderName: body.senderName?.trim() || undefined,
      senderPhone: body.senderPhone?.trim() || undefined,
      senderAddress: body.senderAddress?.trim() || undefined,
      senderWebsite: body.senderWebsite?.trim() || undefined,
      senderRut: body.senderRut?.trim() || undefined,
      printColorMode: normalizeColorMode(body.printColorMode),
      paperFormat: normalizePaperFormat(body.paperFormat),
    };

    const pdfBuffer = await generateShippingLabelPDF(labelData);
    return buildPdfResponse(pdfBuffer, labelData);
  } catch (error) {
    console.error("Error generando PDF de etiqueta:", error);
    return NextResponse.json(
      { message: "Error al generar el PDF de la etiqueta" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorizedAdminResponse();
  }
  try {
    const { searchParams } = new URL(request.url);
    const labelData: ShippingLabelPDFData = {
      recipientName: searchParams.get("recipientName") || "",
      recipientPhone: searchParams.get("recipientPhone") || "",
      recipientDept: searchParams.get("recipientDept") || "Montevideo",
      recipientCity: searchParams.get("recipientCity") || "",
      recipientAddress: searchParams.get("recipientAddress") || "",
      shippingAgency: searchParams.get("shippingAgency") || "DAC",
      deliveryType: normalizeDeliveryType(searchParams.get("deliveryType") || undefined),
      observations: searchParams.get("observations") || undefined,
      rutInfo: searchParams.get("rutInfo") || undefined,
      notes: searchParams.get("notes") || undefined,
      orderNumber: searchParams.get("orderNumber") || `KAM-${Date.now().toString().slice(-6)}`,
      senderName: searchParams.get("senderName") || undefined,
      senderPhone: searchParams.get("senderPhone") || undefined,
      senderAddress: searchParams.get("senderAddress") || undefined,
      senderWebsite: searchParams.get("senderWebsite") || undefined,
      senderRut: searchParams.get("senderRut") || undefined,
      printColorMode: normalizeColorMode(searchParams.get("printColorMode") || undefined),
      paperFormat: normalizePaperFormat(searchParams.get("paperFormat") || undefined),
    };

    const pdfBuffer = await generateShippingLabelPDF(labelData);
    return buildPdfResponse(pdfBuffer, labelData);
  } catch (error) {
    console.error("Error generando PDF de etiqueta (GET):", error);
    return NextResponse.json(
      { message: "Error al generar el PDF de la etiqueta" },
      { status: 500 }
    );
  }
}
