import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { cpus } from "node:os";
import { join } from "node:path";
import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { $ } from "bun";
import pLimit from "p-limit";
import { fontFileBasename } from "@/parse/map-to-rows";
import type { ParsedMetadata } from "@/parse/parse-metadata";
import type { FamilyRow } from "@/parse/map-to-rows";

const FONTS_DATA_ROOT = join(import.meta.dirname, "../../../fonts");
const WORK_DIR = join(import.meta.dirname, "../../.out/woff2");
const R2_BUCKET = "fonts-bucket";

const limitCompress = pLimit(cpus().length);

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
  family: FamilyRow,
  fonts: ParsedMetadata["fonts"],
  variable: boolean,
  existingChecksums: Map<string, string>,
  s3Client: S3Client,
): Promise<ConvertedFile[]> {
  const familyPath = join(FONTS_DATA_ROOT, license, familyDir);
  const outDir = join(WORK_DIR, family.id);
  await mkdir(outDir, { recursive: true });

  const results = await Promise.all(
    fonts.map(async (font): Promise<ConvertedFile | undefined> => {
      const srcPath = join(familyPath, font.filename);
      const variantId = `${family.id}-${font.weight}-${font.style}`;

      const sourceBuffer = await readFile(srcPath);
      const sourceChecksumSha256 = createHash("sha256")
        .update(sourceBuffer)
        .digest("hex");

      if (existingChecksums.get(variantId) === sourceChecksumSha256) {
        console.log(`  skip (unchanged): ${variantId}`);
        return undefined;
      }

      const ttfCopyPath = join(outDir, font.filename);
      await copyFile(srcPath, ttfCopyPath);

      await limitCompress(() => $`woff2_compress ${ttfCopyPath}`.quiet());

      const woff2Path = ttfCopyPath.replace(/\.ttf$/, ".woff2");
      const fileBuffer = await readFile(woff2Path);
      const checksumSha256 = createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
      const basename = fontFileBasename(
        family.id,
        font.style,
        font.weight,
        variable,
      );
      const r2Key = `fonts/${license}/${family.id}/${basename}.woff2`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: "font/woff2",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      return {
        variantId,
        r2Key,
        fileSize: fileBuffer.length,
        checksumSha256,
        sourceChecksumSha256,
      };
    }),
  );

  return results.filter((file): file is ConvertedFile => file !== undefined);
}
