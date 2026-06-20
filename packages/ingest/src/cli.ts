import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildIngestSql } from "./ingest-family";

const OUT_DIR = join(import.meta.dirname, "../.out");

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
const sql = `${SEED_LICENSES_SQL}\n${familySql}\n`;

await mkdir(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, `ingest-${familyDir}.sql`);
await writeFile(outPath, sql, "utf-8");
console.log(outPath);
