import { MetadataRoute } from "next";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/feed/google-shopping", "/google-shopping.xml"],
        disallow: ["/admin/"],
      },
      {
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
        ],
        allow: [
          "/",
          "/google-shopping.xml",
          "/api/feed/google-shopping",
          "/api/products",
          "/api/mcp",
          "/api/health",
          "/.well-known/",
        ],
        disallow: ["/admin/"],
      },
    ],
    sitemap: [
      "https://www.kamaluso.com/sitemap.xml",
      "https://www.kamaluso.com/llms.txt",
    ],
  };
}
