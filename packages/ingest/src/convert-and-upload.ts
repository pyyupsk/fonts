import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";
import { mapFamily, slugify } from "./map-to-rows";
import { parseMetadata } from "./parse-metadata";

const FONTS_DATA_ROOT = join(import.meta.dirname, "../../fonts");
const WORK_DIR = join(import.meta.dirname, "../.out/woff2");
const R2_BUCKET = "fonts-bucket";

export interface ConvertedFile {
  variantId: string;
  r2Key: string;
  fileSize: number;
  checksumSha256: string;
  localPath: string;
}

export async function convertFamilyFiles(
  license: "ofl" | "apache" | "ufl",
  familyDir: string,
): Promise<ConvertedFile[]> {
  const familyPath = join(FONTS_DATA_ROOT, license, familyDir);
  const metadataPath = join(familyPath, "METADATA.pb");
  const raw = await readFile(metadataPath, "utf-8");
  const metadata = parseMetadata(raw);
  const family = mapFamily(metadata);

  const outDir = join(WORK_DIR, family.id);
  await mkdir(outDir, { recursive: true });

  const converted: ConvertedFile[] = [];

  for (const font of metadata.fonts) {
    const srcPath = join(familyPath, font.filename);
    const ttfCopyPath = join(outDir, font.filename);
    await copyFile(srcPath, ttfCopyPath);

    await $`woff2_compress ${ttfCopyPath}`.quiet();

    const woff2Path = ttfCopyPath.replace(/\.ttf$/, ".woff2");
    const fileBuffer = await readFile(woff2Path);
    const checksumSha256 = createHash("sha256").update(fileBuffer).digest("hex");
    const fileStat = await stat(woff2Path);
    const variantId = `${family.id}-${font.weight}-${font.style}`;
    const r2Key = `fonts/${license}/${family.id}/${slugify(family.id)}-${font.weight}-${font.style}.woff2`;

    await $`wrangler r2 object put ${R2_BUCKET}/${r2Key} --file=${woff2Path} --remote`.quiet();

    converted.push({
      variantId,
      r2Key,
      fileSize: fileStat.size,
      checksumSha256,
      localPath: woff2Path,
    });
  }

  return converted;
}
