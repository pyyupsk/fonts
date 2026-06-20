export type FontFileFormat = "woff2";

export interface FontFile {
  id: string;
  variantId: string;
  format: FontFileFormat;
  r2Key: string;
  fileSize: number;
  checksumSha256: string;
}
