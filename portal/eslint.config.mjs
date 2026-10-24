import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Fase 4 completada en portal: no se admiten nuevos `any`.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Scripts / config de Node en CommonJS (PM2, server custom, generadores)
    files: ["**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Specs Playwright sin runner instalado; ver doc/ROADMAP_MEJORAS.md (fase 5)
      "e2e/**",
    ],
  },
];

export default eslintConfig;
