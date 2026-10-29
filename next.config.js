const path = require("path");
const redirects = require("./data/redirects.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
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
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
