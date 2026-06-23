import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { $ } from "bun";
import { mapFamily, slugify } from "../parse/map-to-rows";
import { parseMetadata } from "../parse/parse-metadata";
import { fetchExistingChecksums } from "./d1-client";

const FONTS_DATA_ROOT = join(import.meta.dirname, "../../../fonts");
const WORK_DIR = join(import.meta.dirname, "../../.out/woff2");
const R2_BUCKET = "fonts-bucket";

export interface ConvertedFile {
  variantId: string;
  r2Key: string;
  fileSize: number;
  checksumSha256: string;
  sourceChecksumSha256: string;
}

export async function convertFamilyFiles(
  license: "ofl" | "apache" | "ufl",
  familyDir: string,
  s3Client: S3Client,
): Promise<ConvertedFile[]> {
  const familyPath = join(FONTS_DATA_ROOT, license, familyDir);
  const metadataPath = join(familyPath, "METADATA.pb");
  const raw = await readFile(metadataPath, "utf-8");
  const metadata = parseMetadata(raw);
  const family = mapFamily(metadata);

  const outDir = join(WORK_DIR, family.id);
  await mkdir(outDir, { recursive: true });

  const converted: ConvertedFile[] = [];

  const variantIds = metadata.fonts.map(
    (font) => `${family.id}-${font.weight}-${font.style}`,
  );
  const existingChecksums = await fetchExistingChecksums(variantIds);

  for (const font of metadata.fonts) {
    const srcPath = join(familyPath, font.filename);
    const variantId = `${family.id}-${font.weight}-${font.style}`;

    const sourceBuffer = await readFile(srcPath);
    const sourceChecksumSha256 = createHash("sha256")
      .update(sourceBuffer)
      .digest("hex");

    if (existingChecksums.get(variantId) === sourceChecksumSha256) {
      console.log(`  skip (unchanged): ${variantId}`);
      continue;
    }

    const ttfCopyPath = join(outDir, font.filename);
    await copyFile(srcPath, ttfCopyPath);

    await $`woff2_compress ${ttfCopyPath}`.quiet();

    const woff2Path = ttfCopyPath.replace(/\.ttf$/, ".woff2");
    const fileBuffer = await readFile(woff2Path);
    const checksumSha256 = createHash("sha256")
      .update(fileBuffer)
      .digest("hex");
    const r2Key = `fonts/${license}/${family.id}/${slugify(family.id)}-${font.weight}-${font.style}.woff2`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        Body: fileBuffer,
        ContentType: "font/woff2",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    converted.push({
      variantId,
      r2Key,
      fileSize: fileBuffer.length,
      checksumSha256,
      sourceChecksumSha256,
    });
  }

  return converted;
}
