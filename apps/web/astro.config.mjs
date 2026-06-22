// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://fonts.fasu.dev",
  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [react(), sitemap()],
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
