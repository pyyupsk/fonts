import { drizzle } from "drizzle-orm/d1";
import { families } from "@fonts/db/schema/families";
import { familySubsets } from "@fonts/db/schema/family-subsets";
import { files } from "@fonts/db/schema/files";
import { licenses } from "@fonts/db/schema/licenses";
import { subsets } from "@fonts/db/schema/subsets";
import { variants } from "@fonts/db/schema/variants";
import type { ConvertedFile } from "../upload/convert-and-upload";
import type { FamilyRow, SubsetRow, VariantRow } from "../parse/map-to-rows";

type FakeD1Client = Parameters<typeof drizzle>[0];

const db = drizzle({} as unknown as FakeD1Client);

function toInlinedSql(query: { sql: string; params: unknown[] }): string {
  let paramIndex = 0;
  const inlined = query.sql.replace(/\?/g, () => {
    const param = query.params[paramIndex];
    paramIndex += 1;
    if (param === null || param === undefined) return "NULL";
    if (typeof param === "number") return param.toString();
    if (typeof param === "boolean") return param ? "1" : "0";
    return `'${String(param).replaceAll("'", "''")}'`;
  });
  return `${inlined};`;
}

export function buildSeedLicensesStatements(): string[] {
  const rows = [
    { id: "ofl", name: "SIL Open Font License", url: "https://scripts.sil.org/OFL" },
    { id: "apache", name: "Apache License 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" },
    { id: "ufl", name: "Ubuntu Font License", url: "https://ubuntu.com/legal/font-licence" },
  ];
  return rows.map((row) => toInlinedSql(db.insert(licenses).values(row).onConflictDoNothing().toSQL()));
}

export function buildFamilyStatements(family: FamilyRow, variantRows: VariantRow[], subsetRows: SubsetRow[]): string[] {
  const statements: string[] = [];

  statements.push(
    toInlinedSql(
      db
        .insert(families)
        .values(family)
        .onConflictDoUpdate({
          target: families.id,
          set: {
            name: family.name,
            designer: family.designer,
            category: family.category,
            license: family.license,
            isNoto: family.isNoto,
            dateAdded: family.dateAdded,
            sourceRepositoryUrl: family.sourceRepositoryUrl,
          },
        })
        .toSQL(),
    ),
  );

  for (const subset of subsetRows) {
    statements.push(
      toInlinedSql(db.insert(subsets).values(subset).onConflictDoNothing().toSQL()),
      toInlinedSql(
        db
          .insert(familySubsets)
          .values({ familyId: family.id, subsetId: subset.id })
          .onConflictDoNothing()
          .toSQL(),
      ),
    );
  }

  for (const variant of variantRows) {
    statements.push(
      toInlinedSql(
        db
          .insert(variants)
          .values(variant)
          .onConflictDoUpdate({
            target: variants.id,
            set: { style: variant.style, weight: variant.weight, postScriptName: variant.postScriptName },
          })
          .toSQL(),
      ),
    );
  }

  return statements;
}

export function buildFileStatements(converted: ConvertedFile[]): string[] {
  return converted.map((file) =>
    toInlinedSql(
      db
        .insert(files)
        .values({
          id: `${file.variantId}-woff2`,
          variantId: file.variantId,
          format: "woff2",
          r2Key: file.r2Key,
          fileSize: file.fileSize,
          checksumSha256: file.checksumSha256,
        })
        .onConflictDoUpdate({
          target: files.id,
          set: { r2Key: file.r2Key, fileSize: file.fileSize, checksumSha256: file.checksumSha256 },
        })
        .toSQL(),
    ),
  );
}
