import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // match your 5MB PDF limit
    },
    serverComponentsExternalPackages: ["pdfjs-dist"],
  },
};

export default nextConfig;
