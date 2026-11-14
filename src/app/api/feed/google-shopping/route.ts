import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Refrescar cada 1 hora en CDN

const GOOGLE_FEED_DESCRIPTION_SUFFIX =
  " | Fábrica especialista con el mayor catálogo de papelería sublimable de Uruguay y stock todo el año. Venta de kit completo, interiores por separado o tapas de repuesto sin mínimo de compra.";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCdata(value: string): string {
  return value.replace(/\]\]>/g, "]] >");
}

function detectProductMeasure(text: string): string {
  if (/21\s*x\s*30/i.test(text)) return "21x30cm";
  if (/10\s*x\s*15/i.test(text)) return "10x15cm";
  if (/17\s*x\s*22/i.test(text)) return "17x22cm";
  if (/\bA4\b/i.test(text)) return "A4";
  if (/15\s*x\s*21/i.test(text) || /\bA5\b/i.test(text)) return "15x21cm";
  return "15x21cm";
}

function buildSeoProductTitle(product: Product): string {
  const baseName = product.name.trim();
  const lowerName = baseName.toLowerCase();
  const combinedLower = `${baseName} ${product.description || ""}`.toLowerCase();

  if (product.slug === "pack-2-tapas" || lowerName.includes("pack 2 tapas")) {
    return "Pack 2 Tapas Sublimables 350gr Repuesto 15x21cm A5 Por Separado - Kamaluso";
  }

  if (product.category === "agendas") {
    let title = baseName;
    if (!/agenda\s+sublimable/i.test(title)) {
      title = /^agenda\b/i.test(title)
        ? title.replace(/^agenda\b/i, "Agenda Sublimable")
        : `Agenda Sublimable ${title}`;
    }

    const isUndatedOrSpecialAgenda =
      lowerName.includes("202") ||
      lowerName.includes("perpetua") ||
      lowerName.includes("perpetuo") ||
      combinedLower.includes("perpetuo") ||
      lowerName.includes("profesor") ||
      lowerName.includes("lashista") ||
      lowerName.includes("manicurista") ||
      lowerName.includes("embarazo") ||
      lowerName.includes("pack");

    if (!isUndatedOrSpecialAgenda && !/\b202\d\b/.test(title)) {
      title = `${title} 2027`;
    }

    if (!/15\s*x\s*21\s*cm/i.test(title)) {
      title = `${title} 15x21cm`;
    } else {
      title = title.replace(/15\s*x\s*21\s*cm/gi, "15x21cm");
    }

    return `${title} (Kit Completo o Interior) - Kamaluso`;
  }

  const stationeryKeywords = [
    "libreta",
    "cuaderno",
    "cuadernola",
    "block",
    "planner",
    "recetario",
    "cartulina",
  ];
  const isStationeryItem =
    stationeryKeywords.some((kw) => combinedLower.includes(kw)) ||
    product.category === "libretas" ||
    product.category === "blocks-planners" ||
    product.category === "especiales";

  if (isStationeryItem) {
    let title = baseName;
    const isCartulina =
      lowerName.includes("cartulina") || product.slug.includes("cartulina");

    if (!/sublimable/i.test(title)) {
      title = `${title} Sublimable`;
    }

    const measure = detectProductMeasure(`${baseName} ${product.description || ""}`);
    const measurePattern = new RegExp(
      measure.replace("cm", "\\s*cm").replace("x", "\\s*x\\s*"),
      "i"
    );

    if (measurePattern.test(title)) {
      title = title.replace(measurePattern, measure);
    } else {
      const bareMeasure = measure.replace(/cm$/i, "");
      const barePattern = new RegExp(bareMeasure.replace("x", "\\s*x\\s*"), "i");
      if (barePattern.test(title)) {
        title = title.replace(barePattern, measure);
      } else {
        title = `${title} ${measure}`;
      }
    }

    const suffix = isCartulina
      ? "(Cartón Cristal 350gr) - Kamaluso"
      : "(Kit Tapas 350gr + Interior + Espiral) - Kamaluso";

    return `${title} ${suffix}`;
  }

  return /sublimable/i.test(baseName)
    ? `${baseName} - Kamaluso`
    : `${baseName} Sublimable - Kamaluso`;
}

function buildSeoProductDescription(product: Product): string {
  const rawBase = (product.description || product.name)
    .replace(/\s+/g, " ")
    .replace(/\]\]>/g, "]] >")
    .trim();

  const maxTotalLength = 1000;
  const maxBaseLength = maxTotalLength - GOOGLE_FEED_DESCRIPTION_SUFFIX.length;

  const trimmedBase =
    rawBase.length > maxBaseLength
      ? `${rawBase.slice(0, Math.max(0, maxBaseLength - 3)).trimEnd()}...`
      : rawBase;

  return escapeCdata(`${trimmedBase}${GOOGLE_FEED_DESCRIPTION_SUFFIX}`).slice(
    0,
    maxTotalLength
  );
}

export async function GET() {
  const products = await getAllProducts();
  const baseUrl = "https://www.kamaluso.com";

  const itemsXml = products
    .map((product: Product) => {
      const productUrl = `${baseUrl}/p/${product.slug}`;
      const rawImage =
        product.images && product.images.length > 0 && product.images[0]
          ? product.images[0]
          : `${baseUrl}/agenda_fondo_kamaluso.jpg`;

      const imageUrl = rawImage.startsWith("http")
        ? rawImage
        : `${baseUrl}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;

      const availability = product.inStock ? "in_stock" : "out_of_stock";
      const seoTitle = escapeCdata(buildSeoProductTitle(product));
      const seoDescription = buildSeoProductDescription(product);
      const safeProductType = escapeCdata(`Papelería Sublimable > ${product.category}`);

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title><![CDATA[${seoTitle}]]></g:title>
      <g:description><![CDATA[${seoDescription}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${product.price} UYU</g:price>
      <g:brand>Kamaluso</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type><![CDATA[${safeProductType}]]></g:product_type>
    </item>`;
    })
    .join("\n");

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Kamaluso Sublimación Uruguay</title>
    <link>${baseUrl}</link>
    <description>Catálogo oficial de insumos de papelería sublimable de 350gr en Uruguay</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
