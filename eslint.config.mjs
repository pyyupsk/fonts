// @ts-check
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/.wrangler/**",
      "**/.wrangler-state/**",
      "**/node_modules/**",
      "packages/fonts/**",
    ],
  },
  tseslint.configs.recommended,
  eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
);
