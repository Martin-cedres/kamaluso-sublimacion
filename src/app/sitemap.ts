import { MetadataRoute } from "next";
import { getAllProducts, CATEGORIES } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.kamaluso.com";
  const products = await getAllProducts();

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
    if (!forbiddenSlugs.has(product.slug) && !seenSlugs.has(product.slug)) {
      seenSlugs.add(product.slug);
      productUrls.push({
        url: `${baseUrl}/p/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }
  }

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => c.id !== "todos"
  ).map((cat) => ({
    url: `${baseUrl}/categoria/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mayoristas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guia-sublimacion-papeleria`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/emprender-en-papeleria-sublimable`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/recursos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
