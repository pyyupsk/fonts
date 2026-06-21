import { drizzle } from "drizzle-orm/d1";
import { and, eq, like } from "drizzle-orm";
import { Hono } from "hono";
import { families } from "@fonts/db/schema/families";
import { familySubsets } from "@fonts/db/schema/family-subsets";
import { files } from "@fonts/db/schema/files";
import { subsets } from "@fonts/db/schema/subsets";
import { variants } from "@fonts/db/schema/variants";
import type { Bindings } from "../bindings";

export const fontsRoute = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const category = c.req.query("category");
    const license = c.req.query("license");
    const search = c.req.query("search");

    const conditions = [
      category ? eq(families.category, category) : undefined,
      license ? eq(families.license, license) : undefined,
      search ? like(families.name, `%${search}%`) : undefined,
    ].filter((condition) => condition !== undefined);

    const rows = await db
      .select()
      .from(families)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return c.json({ families: rows });
  })
  .get("/:family", async (c) => {
    const db = drizzle(c.env.DB);
    const familyId = c.req.param("family");

    const [family] = await db.select().from(families).where(eq(families.id, familyId));
    if (!family) {
      return c.json({ error: "family not found" }, 404);
    }

    const familyVariants = await db.select().from(variants).where(eq(variants.familyId, familyId));

    const familySubsetRows = await db
      .select({ id: subsets.id, name: subsets.name })
      .from(familySubsets)
      .innerJoin(subsets, eq(subsets.id, familySubsets.subsetId))
      .where(eq(familySubsets.familyId, familyId));

    return c.json({ family, variants: familyVariants, subsets: familySubsetRows });
  })
  .get("/:family/:file", async (c) => {
    const familyId = c.req.param("family");
    const fileName = c.req.param("file");
    const variantId = fileName.replace(/\.woff2$/, "");

    const cache = caches.default;
    const cacheKey = new Request(c.req.url);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    const db = drizzle(c.env.DB);
    const [fileRow] = await db
      .select({ r2Key: files.r2Key })
      .from(files)
      .innerJoin(variants, eq(variants.id, files.variantId))
      .where(and(eq(files.variantId, variantId), eq(variants.familyId, familyId)));

    if (!fileRow) {
      return c.json({ error: "file not found" }, 404);
    }

    const object = await c.env.FONTS_BUCKET.get(fileRow.r2Key);
    if (!object) {
      return c.json({ error: "file not found in storage" }, 404);
    }

    const response = new Response(object.body, {
      headers: {
        "Content-Type": "font/woff2",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": object.size.toString(),
      },
    });

    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  });
