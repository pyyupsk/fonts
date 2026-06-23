import { S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

const SECRET_SCHEMA = z.string().trim().min(1);
const ENDPOINT_SCHEMA = z.url().trim();

function readEnvVar<T>(name: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(process.env[name]);
  if (!result.success) {
    throw new Error(
      `missing or invalid env var ${name}: ${result.error.message}`,
    );
  }
  return result.data;
}

export function loadCloudflareApiToken(): string {
  return readEnvVar("CLOUDFLARE_API_TOKEN", SECRET_SCHEMA);
}

export function loadCloudflareAccountId(): string {
  return readEnvVar("CLOUDFLARE_ACCOUNT_ID", SECRET_SCHEMA);
}

export function createR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: readEnvVar("R2_ENDPOINT", ENDPOINT_SCHEMA),
    credentials: {
      accessKeyId: readEnvVar("R2_ACCESS_KEY_ID", SECRET_SCHEMA),
      secretAccessKey: readEnvVar("R2_SECRET_ACCESS_KEY", SECRET_SCHEMA),
    },
  });
}
