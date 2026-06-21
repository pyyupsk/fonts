import { Hono } from "hono";
import { fontsRoute } from "./routes/fonts";
import type { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/api/fonts", fontsRoute);

export default app;
