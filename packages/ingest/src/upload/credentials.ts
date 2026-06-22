import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

const REPO_ROOT = join(import.meta.dirname, "../../../..");

const SECRET_SCHEMA = z.string().trim().min(1);
const ENDPOINT_SCHEMA = z.url().trim();

async function readSecretFile<T>(fileName: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(join(REPO_ROOT, fileName), "utf-8");
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`invalid contents in ${fileName}: ${result.error.message}`);
  }
  return result.data;
}

export async function loadCloudflareApiToken(): Promise<string> {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return SECRET_SCHEMA.parse(process.env.CLOUDFLARE_API_TOKEN);
  }
  return readSecretFile(".cloudflare-token", SECRET_SCHEMA);
}

export async function loadCloudflareAccountId(): Promise<string> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    return SECRET_SCHEMA.parse(process.env.CLOUDFLARE_ACCOUNT_ID);
  }
  return readSecretFile(".cloudflare-account-id", SECRET_SCHEMA);
}

export async function createR2Client(): Promise<S3Client> {
  const [accessKeyId, secretAccessKey, endpoint] = await Promise.all([
    readSecretFile(".r2-access-key-id", SECRET_SCHEMA),
    readSecretFile(".r2-secret-access-key", SECRET_SCHEMA),
    readSecretFile(".r2-endpoint", ENDPOINT_SCHEMA),
  ]);

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}
