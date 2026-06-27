import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Convex backend is a workspace package shipped as TypeScript source,
  // so Next must transpile it.
  transpilePackages: ["@fintel/backend"],
};

export default nextConfig;
