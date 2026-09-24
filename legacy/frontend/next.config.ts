import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, "..");
const packagesRoot = path.join(monorepoRoot, "packages");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@realestate/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    middlewareClientMaxBodySize: "100mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "72.61.6.232",
        port: "3000",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "72.61.6.232",
        port: "3001",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {
      "@realestate/ui": path.join(packagesRoot, "ui", "src", "index.ts"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@realestate/ui": path.join(packagesRoot, "ui", "src", "index.ts"),
    };
    return config;
  },
};

export default nextConfig;
