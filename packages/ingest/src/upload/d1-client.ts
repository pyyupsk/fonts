import { loadCloudflareAccountId, loadCloudflareApiToken } from "./credentials";

const DATABASE_ID = "abeacae9-07fb-4b79-a428-699ac9f31c2f";

interface D1QueryResponse<T> {
  success: boolean;
  errors: unknown[];
  result: { results: T[] }[];
}

export async function queryD1<T>(sql: string, params: unknown[]): Promise<T[]> {
  const token = loadCloudflareApiToken();
  const accountId = loadCloudflareAccountId();

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );
  const json = (await res.json()) as D1QueryResponse<T>;
  if (!json.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  }
  return json.result[0]?.results ?? [];
}

const MAX_VARIANT_IDS_PER_QUERY = 100;

export async function fetchExistingChecksums(
  variantIds: string[],
): Promise<Map<string, string>> {
  if (variantIds.length === 0) return new Map();

  const result = new Map<string, string>();
  for (
    let offset = 0;
    offset < variantIds.length;
    offset += MAX_VARIANT_IDS_PER_QUERY
  ) {
    const chunk = variantIds.slice(offset, offset + MAX_VARIANT_IDS_PER_QUERY);
    const placeholders = chunk.map(() => "?").join(",");
    const rows = await queryD1<{
      variant_id: string;
      source_checksum_sha256: string;
    }>(
      `SELECT variant_id, source_checksum_sha256 FROM files WHERE variant_id IN (${placeholders})`,
      chunk,
    );
    for (const row of rows) {
      result.set(row.variant_id, row.source_checksum_sha256);
    }
  }
  return result;
}
