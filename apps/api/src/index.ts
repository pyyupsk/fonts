import { Hono } from "hono";
import { cors } from "hono/cors";
import { fontsRoute } from "./routes/fonts";
import type { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>()
  .use("/api/*", cors())
  .route("/api/fonts", fontsRoute);

export type AppType = typeof app;

export default app;
