// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [react()],
  server: {
    host: "0.0.0.0",
  },
});
