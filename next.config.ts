import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    // Force framer-motion into a single chunk to prevent TDZ errors
    // caused by circular dependencies in the production bundle
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
