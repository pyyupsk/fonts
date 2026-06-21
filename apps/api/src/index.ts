import { Hono } from "hono";
import { cors } from "hono/cors";
import { fontsRoute } from "./routes/fonts";
import type { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());
app.route("/api/fonts", fontsRoute);

export default app;
