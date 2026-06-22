import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, like } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { families } from "@fonts/db/schema/families";
import { familySubsets } from "@fonts/db/schema/family-subsets";
import { files } from "@fonts/db/schema/files";
import { subsets } from "@fonts/db/schema/subsets";
import { variants } from "@fonts/db/schema/variants";
import type { Bindings } from "../bindings";

const listQuerySchema = z.object({
  category: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  search: z.string().min(1).max(100).optional(),
});

const familyParamSchema = z.object({
  family: z.string().min(1).max(100),
});

export const fontsRoute = new Hono<{ Bindings: Bindings }>()
  .get("/", zValidator("query", listQuerySchema), async (c) => {
    const db = drizzle(c.env.DB);
    const { category, license, search } = c.req.valid("query");

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
  .get("/:family", zValidator("param", familyParamSchema), async (c) => {
    const db = drizzle(c.env.DB);
    const { family: familyId } = c.req.valid("param");

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
