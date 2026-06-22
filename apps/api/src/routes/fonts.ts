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

    const familyVariants = await db
      .select({
        id: variants.id,
        familyId: variants.familyId,
        style: variants.style,
        weight: variants.weight,
        postScriptName: variants.postScriptName,
        r2Key: files.r2Key,
      })
      .from(variants)
      .innerJoin(files, eq(files.variantId, variants.id))
      .where(eq(variants.familyId, familyId));

    const familySubsetRows = await db
      .select({ id: subsets.id, name: subsets.name })
      .from(familySubsets)
      .innerJoin(subsets, eq(subsets.id, familySubsets.subsetId))
      .where(eq(familySubsets.familyId, familyId));

    return c.json({
      family,
      variants: familyVariants.map(({ r2Key, ...variant }) => ({
        ...variant,
        fileUrl: `${c.env.FONTS_PUBLIC_BASE}/${r2Key}`,
      })),
      subsets: familySubsetRows,
    });
  });
