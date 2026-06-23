import type { NextConfig } from "next";
import path from "path";

const backendUrl =
  process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },
    ],
  },
};

export default nextConfig;
