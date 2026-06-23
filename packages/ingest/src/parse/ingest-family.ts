import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mapFamily, mapSubsets, mapVariants } from "./map-to-rows";
import { parseMetadata } from "./parse-metadata";
import type { FamilyRow, SubsetRow, VariantRow } from "./map-to-rows";

const FONTS_DATA_ROOT = join(import.meta.dirname, "../../../fonts");

export interface FamilyRows {
  family: FamilyRow;
  variants: VariantRow[];
  subsets: SubsetRow[];
}

export async function loadFamilyRows(
  license: "ofl" | "apache" | "ufl",
  familyDir: string,
): Promise<FamilyRows> {
  const metadataPath = join(FONTS_DATA_ROOT, license, familyDir, "METADATA.pb");
  const raw = await readFile(metadataPath, "utf-8");
  const metadata = parseMetadata(raw);

  const family = mapFamily(metadata);
  const variants = mapVariants(metadata, family.id);
  const subsets = mapSubsets(metadata);

  return { family, variants, subsets };
}
