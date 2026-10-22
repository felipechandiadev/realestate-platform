import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, "..");
const packagesRoot = path.join(monorepoRoot, "packages");
const uiPackageEntry = path.join(packagesRoot, "ui", "src", "index.ts");
// Turbopack resolveAlias must be relative to turbopack.root (monorepo root).
const uiPackageEntryRelative = "packages/ui/src/index.ts";

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@realestate/ui", "@realestate/api-client"],
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
      // Core API (local + prod host already used in deploy/nginx)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8000",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "core.bravoshottpropiedades.cl",
        pathname: "/public/**",
      },
      // R2 public hosts referenciados en core/scripts/update-r2-urls.ts
      {
        protocol: "https",
        hostname: "pub-f23df7eb40cc418aac080ce07e60c1a8.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-5ebfb00e2816441a8e34c1ccc36e6195.r2.dev",
        pathname: "/**",
      },
      // Si R2_PUBLIC_URL usa otro host, añadirlo aquí (sin wildcards **)
    ],
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

export default withSerwist(nextConfig);
