import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { loadFamilyRows } from "../parse/ingest-family";
import { buildFamilyStatements, buildFileStatements, buildSeedLicensesStatements } from "../sql/build-statements";
import { convertFamilyFiles } from "../upload/convert-and-upload";
import { createR2Client } from "../upload/credentials";

const OUT_DIR = join(import.meta.dirname, "../../.out");
const USAGE = "usage: ingest-family <ofl|apache|ufl> <family-dir>";

const { positionals } = parseArgs({ allowPositionals: true });
const [license, familyDir] = positionals;
if (license !== "ofl" && license !== "apache" && license !== "ufl") {
  throw new Error(USAGE);
}
if (!familyDir) {
  throw new Error(USAGE);
}

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
