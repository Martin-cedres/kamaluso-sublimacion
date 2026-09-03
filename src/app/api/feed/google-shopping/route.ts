import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Refrescar cada 1 hora en CDN

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await getAllProducts();
  const baseUrl = "https://www.kamaluso.com";

  const itemsXml = products
    .map((product) => {
      const productUrl = `${baseUrl}/p/${product.slug}`;
      const rawImage =
        product.images && product.images.length > 0 && product.images[0]
          ? product.images[0]
          : `${baseUrl}/agenda_fondo_kamaluso.jpg`;

      const imageUrl = rawImage.startsWith("http")
        ? rawImage
        : `${baseUrl}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;

      const availability = product.inStock ? "in_stock" : "out_of_stock";
      const cleanDesc = (product.description || product.name).slice(0, 1000);

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${cleanDesc}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${product.price} UYU</g:price>
      <g:brand>Kamaluso</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type><![CDATA[Papelería Sublimable > ${product.category}]]></g:product_type>
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
