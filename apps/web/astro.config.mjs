// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://fonts.fasu.dev",
  output: "static",
  // keep Astro 6 HTML-aware whitespace; v7 default "jsx" drops spaces between inline elements
  compressHTML: true,
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  integrations: [react(), sitemap()],
  env: {
    schema: {
      API_BASE: envField.string({ context: "server", access: "secret" }),
      PUBLIC_API_BASE: envField.string({
        context: "server",
        access: "public",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react-dom/client", "react", "react/jsx-runtime"],
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
