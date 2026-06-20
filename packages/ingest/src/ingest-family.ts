import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mapFamily, mapSubsets, mapVariants } from "./map-to-rows";
import { parseMetadata } from "./parse-metadata";

const FONTS_DATA_ROOT = join(import.meta.dirname, "../../fonts");

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export async function buildIngestSql(license: "ofl" | "apache" | "ufl", familyDir: string): Promise<string> {
  const metadataPath = join(FONTS_DATA_ROOT, license, familyDir, "METADATA.pb");
  const raw = await readFile(metadataPath, "utf-8");
  const metadata = parseMetadata(raw);

  const family = mapFamily(metadata);
  const variants = mapVariants(metadata, family.id);
  const subsets = mapSubsets(metadata);

  const statements: string[] = [];

  statements.push(
    `INSERT INTO families (id, name, designer, category, license, is_noto, date_added, source_repository_url)
     VALUES (${sqlString(family.id)}, ${sqlString(family.name)}, ${sqlString(family.designer)}, ${sqlString(family.category)}, ${sqlString(family.license)}, ${family.isNoto ? 1 : 0}, ${sqlString(family.dateAdded)}, ${sqlString(family.sourceRepositoryUrl)})
     ON CONFLICT (id) DO UPDATE SET name=excluded.name, designer=excluded.designer, category=excluded.category, license=excluded.license, is_noto=excluded.is_noto, date_added=excluded.date_added, source_repository_url=excluded.source_repository_url;`,
  );

  for (const subset of subsets) {
    statements.push(
      `INSERT INTO subsets (id, name) VALUES (${sqlString(subset.id)}, ${sqlString(subset.name)}) ON CONFLICT (id) DO NOTHING;`,
    );
    statements.push(
      `INSERT INTO family_subsets (family_id, subset_id) VALUES (${sqlString(family.id)}, ${sqlString(subset.id)}) ON CONFLICT DO NOTHING;`,
    );
  }

  for (const variant of variants) {
    statements.push(
      `INSERT INTO variants (id, family_id, style, weight, post_script_name)
       VALUES (${sqlString(variant.id)}, ${sqlString(variant.familyId)}, ${sqlString(variant.style)}, ${variant.weight}, ${sqlString(variant.postScriptName)})
       ON CONFLICT (id) DO UPDATE SET style=excluded.style, weight=excluded.weight, post_script_name=excluded.post_script_name;`,
    );
  }

  return statements.join("\n");
}
