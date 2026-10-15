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
};

module.exports = nextConfig;
