import { MetadataRoute } from "next";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/feed/google-shopping", "/google-shopping.xml"],
        disallow: ["/admin/", "/api/admin/", "/api/orders", "/checkout", "/cdn-cgi/"],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Google-Extended",
          "OAI-SearchBot",
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Applebot-Extended",
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
        disallow: ["/admin/", "/api/admin/", "/api/orders", "/checkout", "/cdn-cgi/"],
      },
    ],
    sitemap: "https://www.kamaluso.com/sitemap.xml",
  };
}
