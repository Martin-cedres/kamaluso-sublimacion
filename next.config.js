const path = require("path");
const redirects = require("./data/redirects.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return redirects;
  },
  async rewrites() {
    return [
      {
        source: "/google-shopping.xml",
        destination: "/api/feed/google-shopping",
      },
      {
        source: "/api/v1/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  async headers() {
    const agentLinkHeader = [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</.well-known/ai-catalog.json>; rel="service-desc"',
      '</.well-known/mcp/server-card.json>; rel="service-desc"',
      '</.well-known/agent-card.json>; rel="service-desc"',
      '</.well-known/agent-skills/index.json>; rel="service-meta"',
      '</.well-known/oauth-protected-resource>; rel="service-meta"',
      '</llms.txt>; rel="service-doc"',
      '</auth.md>; rel="service-doc"',
      '</openapi.json>; rel="service-desc"',
      '</developers>; rel="service-doc"',
    ].join(", ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: agentLinkHeader,
          },
        ],
      },
      {
        source: "/.well-known/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "RateLimit-Limit", value: "120" },
          { key: "RateLimit-Remaining", value: "119" },
          { key: "RateLimit-Reset", value: "60" },
          { key: "RateLimit-Policy", value: "120;w=60" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
