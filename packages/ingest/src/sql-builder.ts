import type { ConvertedFile } from "./convert-and-upload";

export const SEED_LICENSES_SQL = `
INSERT INTO licenses (id, name, url) VALUES ('ofl', 'SIL Open Font License', 'https://scripts.sil.org/OFL') ON CONFLICT (id) DO NOTHING;
INSERT INTO licenses (id, name, url) VALUES ('apache', 'Apache License 2.0', 'https://www.apache.org/licenses/LICENSE-2.0') ON CONFLICT (id) DO NOTHING;
INSERT INTO licenses (id, name, url) VALUES ('ufl', 'Ubuntu Font License', 'https://ubuntu.com/legal/font-licence') ON CONFLICT (id) DO NOTHING;
`;

export function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function buildFilesSql(converted: ConvertedFile[]): string {
  return converted
    .map(
      (file) => `INSERT INTO files (id, variant_id, format, r2_key, file_size, checksum_sha256)
     VALUES (${sqlString(`${file.variantId}-woff2`)}, ${sqlString(file.variantId)}, 'woff2', ${sqlString(file.r2Key)}, ${file.fileSize}, ${sqlString(file.checksumSha256)})
     ON CONFLICT (id) DO UPDATE SET r2_key=excluded.r2_key, file_size=excluded.file_size, checksum_sha256=excluded.checksum_sha256;`,
    )
    .join("\n");
}
