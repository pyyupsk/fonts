import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { convertFamilyFiles } from "./convert-and-upload";
import { buildIngestSql } from "./ingest-family";

const OUT_DIR = join(import.meta.dirname, "../.out");
const TOKEN_FILE = join(import.meta.dirname, "../../../.cloudflare-token");

if (!process.env.CLOUDFLARE_API_TOKEN) {
  process.env.CLOUDFLARE_API_TOKEN = (await readFile(TOKEN_FILE, "utf-8")).trim();
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

const SEED_LICENSES_SQL = `
INSERT INTO licenses (id, name, url) VALUES ('ofl', 'SIL Open Font License', 'https://scripts.sil.org/OFL') ON CONFLICT (id) DO NOTHING;
INSERT INTO licenses (id, name, url) VALUES ('apache', 'Apache License 2.0', 'https://www.apache.org/licenses/LICENSE-2.0') ON CONFLICT (id) DO NOTHING;
INSERT INTO licenses (id, name, url) VALUES ('ufl', 'Ubuntu Font License', 'https://ubuntu.com/legal/font-licence') ON CONFLICT (id) DO NOTHING;
`;

const [license, familyDir] = process.argv.slice(2);
if (license !== "ofl" && license !== "apache" && license !== "ufl") {
  throw new Error("usage: ingest-family <ofl|apache|ufl> <family-dir>");
}
if (!familyDir) {
  throw new Error("usage: ingest-family <ofl|apache|ufl> <family-dir>");
}

const familySql = await buildIngestSql(license, familyDir);
const converted = await convertFamilyFiles(license, familyDir);

const filesSql = converted
  .map(
    (file) => `INSERT INTO files (id, variant_id, format, r2_key, file_size, checksum_sha256)
     VALUES (${sqlString(`${file.variantId}-woff2`)}, ${sqlString(file.variantId)}, 'woff2', ${sqlString(file.r2Key)}, ${file.fileSize}, ${sqlString(file.checksumSha256)})
     ON CONFLICT (id) DO UPDATE SET r2_key=excluded.r2_key, file_size=excluded.file_size, checksum_sha256=excluded.checksum_sha256;`,
  )
  .join("\n");

const sql = `${SEED_LICENSES_SQL}\n${familySql}\n${filesSql}\n`;

await mkdir(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, `ingest-${familyDir}.sql`);
await writeFile(outPath, sql, "utf-8");
console.log(outPath);
