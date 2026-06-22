import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineCommand, runMain } from "citty";
import pLimit from "p-limit";
import { loadFamilyRows } from "../parse/ingest-family";
import { buildFamilyStatements, buildFileStatements, buildSeedLicensesStatements } from "../sql/build-statements";
import { convertFamilyFiles } from "../upload/convert-and-upload";
import { createR2Client } from "../upload/credentials";

const OUT_DIR = join(import.meta.dirname, "../../.out");
const FONTS_DATA_ROOT = join(import.meta.dirname, "../../../fonts");
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

async function ingestAll(limit: number | undefined) {
  const s3Client = await createR2Client();

  const allTargets = await listFamilyTargets();
  const targets = limit ? allTargets.slice(0, limit) : allTargets;
  console.log(`found ${allTargets.length} families, processing ${targets.length}`);

  const statements: string[] = buildSeedLicensesStatements();
  const failures: { familyDir: string; error: string }[] = [];
  let completed = 0;

  const limitConcurrency = pLimit(CONCURRENCY);

  await Promise.all(
    targets.map(({ license, familyDir }) =>
      limitConcurrency(async () => {
        try {
          const { family, variants, subsets } = await loadFamilyRows(license, familyDir);
          const converted = await convertFamilyFiles(license, familyDir, s3Client);
          statements.push(...buildFamilyStatements(family, variants, subsets), ...buildFileStatements(converted));
        } catch (error) {
          failures.push({ familyDir, error: error instanceof Error ? error.message : String(error) });
        } finally {
          completed += 1;
          if (completed % 50 === 0) {
            console.log(`${completed}/${targets.length} families processed (${failures.length} failed)`);
          }
        }
      }),
    ),
  );

  console.log(`done: ${completed - failures.length} succeeded, ${failures.length} failed`);
  for (const failure of failures) {
    console.log(`  failed: ${failure.familyDir} — ${failure.error}`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, "ingest-all.sql");
  await writeFile(outPath, `${statements.join("\n")}\n`, "utf-8");
  console.log(outPath);
}

async function ingestOne(license: (typeof LICENSES)[number], familyDir: string) {
  const s3Client = await createR2Client();

  const { family, variants, subsets } = await loadFamilyRows(license, familyDir);
  const converted = await convertFamilyFiles(license, familyDir, s3Client);

  const statements = [
    ...buildSeedLicensesStatements(),
    ...buildFamilyStatements(family, variants, subsets),
    ...buildFileStatements(converted),
  ];

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `ingest-${familyDir}.sql`);
  await writeFile(outPath, `${statements.join("\n")}\n`, "utf-8");
  console.log(outPath);
}

const main = defineCommand({
  meta: { name: "ingest", description: "Ingest Google Fonts family/families into D1 + R2" },
  args: {
    all: { type: "boolean", description: "ingest every family under packages/fonts" },
    limit: { type: "string", description: "max families to process (with --all)" },
    license: { type: "positional", required: false, description: "ofl | apache | ufl" },
    familyDir: { type: "positional", required: false, description: "family directory name" },
  },
  async run({ args }) {
    if (args.all) {
      await ingestAll(args.limit ? Number(args.limit) : undefined);
      return;
    }

    if (args.license !== "ofl" && args.license !== "apache" && args.license !== "ufl") {
      throw new Error("license must be one of: ofl, apache, ufl (or pass --all)");
    }
    if (!args.familyDir) {
      throw new Error("familyDir is required (or pass --all)");
    }
    await ingestOne(args.license, args.familyDir);
  },
});

runMain(main);
