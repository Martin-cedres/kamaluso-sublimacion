const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
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

