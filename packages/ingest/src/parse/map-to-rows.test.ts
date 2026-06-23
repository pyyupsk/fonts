import { describe, expect, test } from "bun:test";
import type { ParsedMetadata } from "./parse-metadata";
import { mapFamily, mapSubsets, mapVariants, slugify } from "./map-to-rows";

const baseMetadata: ParsedMetadata = {
  name: "Roboto Slab",
  designer: "Christian Robertson",
  license: "OFL",
  category: "SERIF",
  dateAdded: "2014-12-01",
  fonts: [
    {
      style: "normal",
      weight: 400,
      filename: "RobotoSlab-Regular.ttf",
      postScriptName: "RobotoSlab-Regular",
    },
  ],
  axes: [{ tag: "wght", minValue: 100, maxValue: 900 }],
  subsets: ["latin", "cyrillic"],
  sourceRepositoryUrl: "https://github.com/google/fonts",
};

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Roboto Slab")).toBe("roboto-slab");
  });

  test("strips leading/trailing separators", () => {
    expect(slugify("  IBM Plex Sans!  ")).toBe("ibm-plex-sans");
  });
});

describe("mapFamily", () => {
  test("maps known category and license", () => {
    const row = mapFamily(baseMetadata);
    expect(row.id).toBe("roboto-slab");
    expect(row.category).toBe("serif");
    expect(row.license).toBe("ofl");
    expect(row.wghtMin).toBe(100);
    expect(row.wghtMax).toBe(900);
  });

  test("falls back to sans-serif/ofl for unknown category/license", () => {
    const row = mapFamily({
      ...baseMetadata,
      category: "UNKNOWN",
      license: "UNKNOWN",
    });
    expect(row.category).toBe("sans-serif");
    expect(row.license).toBe("ofl");
  });

  test("flags Noto families", () => {
    const row = mapFamily({ ...baseMetadata, name: "Noto Sans" });
    expect(row.isNoto).toBe(true);
  });

  test("null weight range when no wght axis", () => {
    const row = mapFamily({ ...baseMetadata, axes: [] });
    expect(row.wghtMin).toBeNull();
    expect(row.wghtMax).toBeNull();
  });
});

describe("mapVariants", () => {
  test("maps each font entry with composite id", () => {
    const rows = mapVariants(baseMetadata, "roboto-slab");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      id: "roboto-slab-400-normal",
      familyId: "roboto-slab",
      style: "normal",
      weight: 400,
      postScriptName: "RobotoSlab-Regular",
    });
  });
});

describe("mapSubsets", () => {
  test("maps subset names to id/name rows", () => {
    expect(mapSubsets(baseMetadata)).toEqual([
      { id: "latin", name: "latin" },
      { id: "cyrillic", name: "cyrillic" },
    ]);
  });
});
