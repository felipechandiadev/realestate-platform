import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, "..");
const packagesRoot = path.join(monorepoRoot, "packages");
const uiPackageEntry = path.join(packagesRoot, "ui", "src", "index.ts");
// Turbopack resolveAlias must be relative to turbopack.root (monorepo root).
const uiPackageEntryRelative = "packages/ui/src/index.ts";

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
        port: "8000",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "72.61.6.232",
        port: "8000",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "72.61.6.232",
        port: "8001",
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
    ...(process.env.NODE_ENV === "development"
      ? {
          resolveAlias: {
            "@realestate/ui$": uiPackageEntryRelative,
          },
        }
      : {}),
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@realestate/ui$": uiPackageEntry,
    };
    return config;
  },
};

export default nextConfig;
