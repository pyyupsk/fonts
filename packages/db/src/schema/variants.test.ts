import { getTableColumns } from "drizzle-orm";
import { describe, expect, test } from "bun:test";
import { variants } from "./variants";

describe("variants schema", () => {
  test("exposes expected columns", () => {
    expect(Object.keys(getTableColumns(variants)).sort()).toEqual(
      ["id", "familyId", "style", "weight", "postScriptName"].sort(),
    );
  });

  test("id is primary key", () => {
    expect(getTableColumns(variants).id.primary).toBe(true);
  });
});
