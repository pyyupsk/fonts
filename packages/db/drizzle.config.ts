import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "drizzle-kit";

const D1_DIR = join(
  process.cwd(),
  "../../.wrangler-state/v3/d1/miniflare-D1DatabaseObject",
);
const localDbFile = readdirSync(D1_DIR).find(
  (name) => name.endsWith(".sqlite") && name !== "metadata.sqlite",
);
const localDbPath = localDbFile ? join(D1_DIR, localDbFile) : "";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema",
  out: "./drizzle",
  dbCredentials: {
    url: localDbPath ?? "",
  },
});
