import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { families } from "./families";

describe("families schema", () => {
  test("exposes expected columns", () => {
    expect(
      Object.keys(getTableColumns(families)).sort((a, b) => a.localeCompare(b)),
    ).toEqual(
      [
        "id",
        "name",
        "designer",
        "category",
        "license",
        "isNoto",
        "dateAdded",
        "sourceRepositoryUrl",
        "wghtMin",
        "wghtMax",
      ].sort((a, b) => a.localeCompare(b)),
    );
  });

  test("id is primary key", () => {
    expect(getTableColumns(families).id.primary).toBe(true);
  });
});
