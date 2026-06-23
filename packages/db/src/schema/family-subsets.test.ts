import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { familySubsets } from "./family-subsets";

describe("familySubsets schema", () => {
  test("exposes expected columns", () => {
    expect(
      Object.keys(getTableColumns(familySubsets)).sort((a, b) =>
        a.localeCompare(b),
      ),
    ).toEqual(["familyId", "subsetId"].sort((a, b) => a.localeCompare(b)));
  });
});
