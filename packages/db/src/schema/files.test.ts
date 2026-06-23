import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { files } from "./files";

describe("files schema", () => {
  test("exposes expected columns", () => {
    expect(Object.keys(getTableColumns(files)).sort((a, b) => a.localeCompare(b))).toEqual(
      [
        "id",
        "variantId",
        "format",
        "r2Key",
        "fileSize",
        "checksumSha256",
        "sourceChecksumSha256",
      ].sort((a, b) => a.localeCompare(b)),
    );
  });

  test("id is primary key", () => {
    expect(getTableColumns(files).id.primary).toBe(true);
  });
});
