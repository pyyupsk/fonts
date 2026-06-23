import { CopyObjectCommand } from "@aws-sdk/client-s3";
import pLimit from "p-limit";
import { queryD1 } from "../upload/d1-client";
import { createR2Client } from "../upload/credentials";

const R2_BUCKET = "fonts-bucket";
const CONCURRENCY = 16;

async function main() {
  const rows = await queryD1<{ r2_key: string }>("SELECT r2_key FROM files", []);
  console.log(`backfilling Cache-Control on ${rows.length} R2 objects`);

  const s3Client = createR2Client();
  const limitConcurrency = pLimit(CONCURRENCY);
  let completed = 0;

  await Promise.all(
    rows.map(({ r2_key }) =>
      limitConcurrency(async () => {
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: R2_BUCKET,
            Key: r2_key,
            CopySource: `${R2_BUCKET}/${r2_key}`,
            MetadataDirective: "REPLACE",
            ContentType: "font/woff2",
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );
        completed += 1;
        if (completed % 200 === 0) {
          console.log(`${completed}/${rows.length}`);
        }
      }),
    ),
  );

  console.log(`done: ${completed}/${rows.length}`);
}

await main();
