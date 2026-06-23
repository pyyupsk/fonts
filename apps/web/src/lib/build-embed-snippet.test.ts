import { describe, expect, test } from "bun:test";
import { buildEmbedSnippet } from "./build-embed-snippet";

describe("buildEmbedSnippet", () => {
  test("uses single weight for static fonts", () => {
    const snippet = buildEmbedSnippet({
      familyName: "Roboto Slab",
      fileUrl: "https://cdn.fasu.dev/roboto-slab-400-normal.woff2",
      weight: 400,
      style: "normal",
      wghtMin: null,
      wghtMax: null,
    });
    expect(snippet).toContain('font-family: "Roboto Slab";');
    expect(snippet).toContain("font-weight: 400;");
    expect(snippet).toContain("font-style: normal;");
  });

  test("uses weight range for variable fonts", () => {
    const snippet = buildEmbedSnippet({
      familyName: "Inter",
      fileUrl: "https://cdn.fasu.dev/inter-variable.woff2",
      weight: 400,
      style: "normal",
      wghtMin: 100,
      wghtMax: 900,
    });
    expect(snippet).toContain("font-weight: 100 900;");
  });

  test("treats equal min/max as static, not variable", () => {
    const snippet = buildEmbedSnippet({
      familyName: "Roboto Slab",
      fileUrl: "https://cdn.fasu.dev/roboto-slab-400-normal.woff2",
      weight: 400,
      style: "normal",
      wghtMin: 400,
      wghtMax: 400,
    });
    expect(snippet).toContain("font-weight: 400;");
  });
});
