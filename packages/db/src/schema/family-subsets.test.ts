import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { familySubsets } from "./family-subsets";

describe("familySubsets schema", () => {
  test("exposes expected columns", () => {
    expect(Object.keys(getTableColumns(familySubsets)).sort()).toEqual(
      ["familyId", "subsetId"].sort(),
    );
  });
});
