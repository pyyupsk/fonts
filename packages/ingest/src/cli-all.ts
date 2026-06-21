import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { convertFamilyFiles } from "./convert-and-upload";
import { createR2Client } from "./credentials";
import { buildIngestSql } from "./ingest-family";
import { runWithConcurrency } from "./run-with-concurrency";
import { buildFilesSql, SEED_LICENSES_SQL } from "./sql-builder";

const FONTS_DATA_ROOT = join(import.meta.dirname, "../../fonts");
const OUT_DIR = join(import.meta.dirname, "../.out");
const CONCURRENCY = 16;

const LICENSES = ["ofl", "apache", "ufl"] as const;

interface FamilyTarget {
  license: (typeof LICENSES)[number];
  familyDir: string;
}

async function listFamilyTargets(): Promise<FamilyTarget[]> {
  const targets: FamilyTarget[] = [];
  for (const license of LICENSES) {
    const entries = await readdir(join(FONTS_DATA_ROOT, license), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        targets.push({ license, familyDir: entry.name });
      }
    }
  }
  return targets;
}

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

const allTargets = await listFamilyTargets();
const targets = limit ? allTargets.slice(0, limit) : allTargets;
console.log(`found ${allTargets.length} families, processing ${targets.length}`);

const s3Client = await createR2Client();

const sqlChunks: string[] = [SEED_LICENSES_SQL];
const failures: { familyDir: string; error: string }[] = [];
let completed = 0;

await runWithConcurrency(targets, CONCURRENCY, async ({ license, familyDir }) => {
  try {
    const familySql = await buildIngestSql(license, familyDir);
    const converted = await convertFamilyFiles(license, familyDir, s3Client);
    const filesSql = buildFilesSql(converted);
    sqlChunks.push(familySql, filesSql);
  } catch (error) {
    failures.push({ familyDir, error: error instanceof Error ? error.message : String(error) });
  } finally {
    completed += 1;
    if (completed % 50 === 0) {
      console.log(`${completed}/${targets.length} families processed (${failures.length} failed)`);
    }
  }
});

console.log(`done: ${completed - failures.length} succeeded, ${failures.length} failed`);
for (const failure of failures) {
  console.log(`  failed: ${failure.familyDir} — ${failure.error}`);
}

await mkdir(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, "ingest-all.sql");
await writeFile(outPath, sqlChunks.join("\n"), "utf-8");
console.log(outPath);
