import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
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
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: [
      "https://www.kamaluso.com/sitemap.xml",
      "https://www.kamaluso.com/llms.txt",
    ],
  };
}
