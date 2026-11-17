import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import ShippingLabelPDFDocument from "./shippingLabelTemplate";
import { ShippingLabelPDFData } from "@/lib/shippingLabelUtils";

/**
 * Renderiza la etiqueta de envío Kamaluso a un Buffer PDF nativo (A6 o Térmica 100x150mm).
 */
export async function generateShippingLabelPDF(
  data: ShippingLabelPDFData
): Promise<Buffer> {
  // Asegurar que @vercel/nft trace las fuentes estándar de pdfkit usadas por createRequire
  const stdFontsDir = path.join(process.cwd(), "node_modules", "pdfkit", "js", "standard-fonts");
  [
    "Helvetica.cjs",
    "HelveticaBold.cjs",
    "HelveticaOblique.cjs",
    "HelveticaBoldOblique.cjs",
  ].forEach((file) => {
    fs.existsSync(path.join(stdFontsDir, file));
  });

  let logoBase64: string | undefined;
  try {
    const logoPngPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPngPath)) {
      const logoBuffer = fs.readFileSync(logoPngPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    }
  } catch (logoErr) {
    console.warn("Advertencia cargando logo para etiqueta PDF:", logoErr);
  }

  let qrBase64: string | undefined;
  try {
    qrBase64 = await QRCode.toDataURL("https://www.kamaluso.com", {
      width: 160,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (qrErr) {
    console.warn("Advertencia generando QR para etiqueta PDF:", qrErr);
  }

  const stream = await renderToStream(
    <ShippingLabelPDFDocument data={data} logoUrl={logoBase64} qrUrl={qrBase64} />
  );

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer | Uint8Array) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: Error) => reject(err));
  });
}
