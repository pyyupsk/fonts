import { describe, expect, test } from "bun:test";
import type { ParsedMetadata } from "./parse-metadata";
import {
  fontFileBasename,
  isVariableFamily,
  mapFamily,
  mapSubsets,
  mapVariants,
  selectFontEntries,
  slugify,
} from "./map-to-rows";

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

describe("isVariableFamily", () => {
  test("true when wght axis spans a range", () => {
    expect(isVariableFamily(baseMetadata)).toBe(true);
  });

  test("false when no wght axis", () => {
    expect(isVariableFamily({ ...baseMetadata, axes: [] })).toBe(false);
  });

  test("false when wght axis is a single point", () => {
    expect(
      isVariableFamily({
        ...baseMetadata,
        axes: [{ tag: "wght", minValue: 400, maxValue: 400 }],
      }),
    ).toBe(false);
  });
});

describe("fontFileBasename", () => {
  test("variable file omits weight", () => {
    expect(fontFileBasename("roboto", "normal", 400, true)).toBe(
      "roboto-normal-variable",
    );
    expect(fontFileBasename("roboto", "italic", 400, true)).toBe(
      "roboto-italic-variable",
    );
  });

  test("static file includes weight", () => {
    expect(fontFileBasename("lobster", "normal", 700, false)).toBe(
      "lobster-normal-700",
    );
  });
});

describe("selectFontEntries", () => {
  const variableMultiWeight: ParsedMetadata = {
    ...baseMetadata,
    fonts: [100, 400, 700].flatMap((weight) =>
      (["normal", "italic"] as const).map((style) => ({
        style,
        weight,
        filename: `Font-${weight}-${style}.ttf`,
        postScriptName: `Font-${weight}-${style}`,
      })),
    ),
  };

  test("keeps one entry per style for variable families, preferring 400", () => {
    const entries = selectFontEntries(variableMultiWeight);
    expect(entries).toHaveLength(2);
    expect(entries.every((font) => font.weight === 400)).toBe(true);
    expect(
      entries.map((font) => font.style).sort((a, b) => a.localeCompare(b)),
    ).toEqual(["italic", "normal"]);
  });

  test("returns all entries for static families", () => {
    const staticFamily = { ...variableMultiWeight, axes: [] };
    expect(selectFontEntries(staticFamily)).toHaveLength(6);
  });

  test("falls back to lightest weight when no 400", () => {
    const noDefault: ParsedMetadata = {
      ...baseMetadata,
      fonts: [
        {
          style: "normal",
          weight: 700,
          filename: "a.ttf",
          postScriptName: "a",
        },
        {
          style: "normal",
          weight: 300,
          filename: "b.ttf",
          postScriptName: "b",
        },
      ],
    };
    expect(selectFontEntries(noDefault)).toEqual([
      { style: "normal", weight: 300, filename: "b.ttf", postScriptName: "b" },
    ]);
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
