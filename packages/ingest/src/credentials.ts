import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { S3Client } from "@aws-sdk/client-s3";

const REPO_ROOT = join(import.meta.dirname, "../../..");

async function readSecretFile(fileName: string): Promise<string> {
  return (await readFile(join(REPO_ROOT, fileName), "utf-8")).trim();
}

export async function loadCloudflareApiToken(): Promise<string> {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
  return readSecretFile(".cloudflare-token");
}

export async function createR2Client(): Promise<S3Client> {
  const [accessKeyId, secretAccessKey, endpoint] = await Promise.all([
    readSecretFile(".r2-access-key-id"),
    readSecretFile(".r2-secret-access-key"),
    readSecretFile(".r2-endpoint"),
  ]);

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}
