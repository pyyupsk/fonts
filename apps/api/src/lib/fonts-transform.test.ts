import { describe, expect, test } from "bun:test";
import {
  buildFileUrl,
  groupSubsetsByFamily,
  groupVariantsByFamily,
  toVariantWithFileUrl,
} from "./fonts-transform";

describe("buildFileUrl", () => {
  test("joins public base and r2 key", () => {
    expect(buildFileUrl("https://cdn.fasu.dev", "roboto-slab-400.woff2")).toBe(
      "https://cdn.fasu.dev/roboto-slab-400.woff2",
    );
  });
});

describe("toVariantWithFileUrl", () => {
  test("strips r2Key and adds fileUrl", () => {
    const result = toVariantWithFileUrl(
      {
        id: "roboto-slab-400-normal",
        familyId: "roboto-slab",
        style: "normal",
        weight: 400,
        postScriptName: "RobotoSlab-Regular",
        r2Key: "roboto-slab-400.woff2",
      },
      "https://cdn.fasu.dev",
    );
    expect(result).toEqual({
      id: "roboto-slab-400-normal",
      familyId: "roboto-slab",
      style: "normal",
      weight: 400,
      postScriptName: "RobotoSlab-Regular",
      fileUrl: "https://cdn.fasu.dev/roboto-slab-400.woff2",
    });
    expect(result).not.toHaveProperty("r2Key");
  });
});

describe("groupVariantsByFamily", () => {
  test("groups variants by familyId with fileUrl attached", () => {
    const grouped = groupVariantsByFamily(
      [
        {
          id: "roboto-slab-400-normal",
          familyId: "roboto-slab",
          style: "normal",
          weight: 400,
          postScriptName: "RobotoSlab-Regular",
          r2Key: "roboto-slab-400.woff2",
        },
        {
          id: "inter-700-normal",
          familyId: "inter",
          style: "normal",
          weight: 700,
          postScriptName: "Inter-Bold",
          r2Key: "inter-700.woff2",
        },
        {
          id: "roboto-slab-700-normal",
          familyId: "roboto-slab",
          style: "normal",
          weight: 700,
          postScriptName: "RobotoSlab-Bold",
          r2Key: "roboto-slab-700.woff2",
        },
      ],
      "https://cdn.fasu.dev",
    );

    expect(grouped.get("roboto-slab")).toHaveLength(2);
    expect(grouped.get("inter")).toHaveLength(1);
    expect(grouped.get("roboto-slab")?.[0]?.fileUrl).toBe(
      "https://cdn.fasu.dev/roboto-slab-400.woff2",
    );
  });

  test("returns empty map for no rows", () => {
    expect(groupVariantsByFamily([], "https://cdn.fasu.dev").size).toBe(0);
  });
});

describe("groupSubsetsByFamily", () => {
  test("groups subsets by familyId", () => {
    const grouped = groupSubsetsByFamily([
      { familyId: "roboto-slab", id: "latin", name: "latin" },
      { familyId: "roboto-slab", id: "cyrillic", name: "cyrillic" },
      { familyId: "inter", id: "latin", name: "latin" },
    ]);

    expect(grouped.get("roboto-slab")).toEqual([
      { id: "latin", name: "latin" },
      { id: "cyrillic", name: "cyrillic" },
    ]);
    expect(grouped.get("inter")).toEqual([{ id: "latin", name: "latin" }]);
  });

  test("returns empty map for no rows", () => {
    expect(groupSubsetsByFamily([]).size).toBe(0);
  });
});
