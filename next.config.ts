import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force the workspace root to THIS app so Turbopack doesn't pick the monorepo root lockfile.
    root: __dirname,
  },
  experimental: {
    // keeps app router stable as you grow
    typedRoutes: false,
  },
};
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
