import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { subsets } from "./subsets";

describe("subsets schema", () => {
  test("exposes expected columns", () => {
    expect(Object.keys(getTableColumns(subsets)).sort()).toEqual(
      ["id", "name"].sort(),
    );
  });

  test("id is primary key", () => {
    expect(getTableColumns(subsets).id.primary).toBe(true);
  });
});
