import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, getTableColumns, like } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { families } from "@fonts/db/schema/families";
import { familySubsets } from "@fonts/db/schema/family-subsets";
import { files } from "@fonts/db/schema/files";
import { licenses } from "@fonts/db/schema/licenses";
import { subsets } from "@fonts/db/schema/subsets";
import { variants } from "@fonts/db/schema/variants";
import type { Bindings } from "@/bindings";
import {
  groupSubsetsByFamily,
  groupVariantsByFamily,
  toVariantWithFileUrl,
} from "@/lib/fonts-transform";

export const listQuerySchema = z.object({
  category: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  search: z.string().min(1).max(100).optional(),
});

export const familyParamSchema = z.object({
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
  .get("/full", async (c) => {
    const db = drizzle(c.env.DB);

    const [familyRows, variantRows, subsetRows] = await Promise.all([
      db
        .select({ ...getTableColumns(families), licenseUrl: licenses.url })
        .from(families)
        .innerJoin(licenses, eq(licenses.id, families.license)),
      db
        .select({
          id: variants.id,
          familyId: variants.familyId,
          style: variants.style,
          weight: variants.weight,
          postScriptName: variants.postScriptName,
          r2Key: files.r2Key,
        })
        .from(variants)
        .innerJoin(files, eq(files.variantId, variants.id)),
      db
        .select({
          familyId: familySubsets.familyId,
          id: subsets.id,
          name: subsets.name,
        })
        .from(familySubsets)
        .innerJoin(subsets, eq(subsets.id, familySubsets.subsetId)),
    ]);

    const variantsByFamily = groupVariantsByFamily(
      variantRows,
      c.env.FONTS_PUBLIC_BASE,
    );
    const subsetsByFamily = groupSubsetsByFamily(subsetRows);

    return c.json({
      families: familyRows.map((family) => ({
        family,
        variants: variantsByFamily.get(family.id) ?? [],
        subsets: subsetsByFamily.get(family.id) ?? [],
      })),
    });
  })
  .get("/:family", zValidator("param", familyParamSchema), async (c) => {
    const db = drizzle(c.env.DB);
    const { family: familyId } = c.req.valid("param");

    const [[family], familyVariants, familySubsetRows] = await Promise.all([
      db
        .select({ ...getTableColumns(families), licenseUrl: licenses.url })
        .from(families)
        .innerJoin(licenses, eq(licenses.id, families.license))
        .where(eq(families.id, familyId)),
      db
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
        .where(eq(variants.familyId, familyId)),
      db
        .select({ id: subsets.id, name: subsets.name })
        .from(familySubsets)
        .innerJoin(subsets, eq(subsets.id, familySubsets.subsetId))
        .where(eq(familySubsets.familyId, familyId)),
    ]);

    if (!family) {
      return c.json({ error: "family not found" }, 404);
    }

    return c.json({
      family,
      variants: familyVariants.map((variant) =>
        toVariantWithFileUrl(variant, c.env.FONTS_PUBLIC_BASE),
      ),
      subsets: familySubsetRows,
    });
  });
