import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { licenses } from "./licenses";

describe("licenses schema", () => {
  test("exposes expected columns", () => {
    expect(Object.keys(getTableColumns(licenses)).sort()).toEqual(
      ["id", "name", "url"].sort(),
    );
  });

  test("id is primary key", () => {
    expect(getTableColumns(licenses).id.primary).toBe(true);
  });
});
