import { MetadataRoute } from "next";
import { getAllProducts, CATEGORIES } from "@/lib/products";
import redirects from "../../data/redirects.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.kamaluso.com";
  const SITE_LAST_MODIFIED = new Date("2026-11-20T00:00:00.000Z");
  const products = await getAllProducts();

  const redirectedPaths = new Set(
    (redirects as Array<{ source: string }>).map((r) => r.source.toLowerCase())
  );

  const forbiddenSlugs = new Set([
    "recetario-infantil-sublimable1",
    "recetario-ifantil",
    "semanal-vertival-flor",
    "copia-de-block-sublimable-10x15cm-con-renglones",
    "block-10x15cm-con-renglones-sublimable",
    "agenda-1-dia-a-la-vista-2024",
    "cuadernola-21x30",
  ]);

  // Asegurar slugs canónicos únicos y excluir URLs antiguas redirigidas
  const seenSlugs = new Set<string>();
  const productUrls: MetadataRoute.Sitemap = [];

  for (const product of products) {
    const productPath = `/p/${product.slug}`.toLowerCase();
    if (
      !forbiddenSlugs.has(product.slug) &&
      !redirectedPaths.has(productPath) &&
      !seenSlugs.has(product.slug)
    ) {
      seenSlugs.add(product.slug);
      productUrls.push({
        url: `${baseUrl}/p/${product.slug}`,
        lastModified: SITE_LAST_MODIFIED,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }
  }

  const activeCategorySlugs = new Set(products.map((p) => p.category));
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => c.id !== "todos" && activeCategorySlugs.has(c.id)
  ).map((cat) => ({
    url: `${baseUrl}/categoria/${cat.id}`,
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mayoristas`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guia-sublimacion-papeleria`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/emprender-en-papeleria-sublimable`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/recursos`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/devoluciones`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
