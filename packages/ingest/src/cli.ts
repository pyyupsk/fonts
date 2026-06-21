import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { convertFamilyFiles } from "./convert-and-upload";
import { createR2Client } from "./credentials";
import { buildIngestSql } from "./ingest-family";
import { buildFilesSql, SEED_LICENSES_SQL } from "./sql-builder";

const OUT_DIR = join(import.meta.dirname, "../.out");

const [license, familyDir] = process.argv.slice(2);
if (license !== "ofl" && license !== "apache" && license !== "ufl") {
  throw new Error("usage: ingest-family <ofl|apache|ufl> <family-dir>");
}
if (!familyDir) {
  throw new Error("usage: ingest-family <ofl|apache|ufl> <family-dir>");
}

const s3Client = await createR2Client();

const familySql = await buildIngestSql(license, familyDir);
const converted = await convertFamilyFiles(license, familyDir, s3Client);
const filesSql = buildFilesSql(converted);

const sql = `${SEED_LICENSES_SQL}\n${familySql}\n${filesSql}\n`;

await mkdir(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, `ingest-${familyDir}.sql`);
await writeFile(outPath, sql, "utf-8");
console.log(outPath);
