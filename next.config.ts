import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // This disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This disables TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
