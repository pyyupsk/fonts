import { describe, expect, test } from "bun:test";
import { buildViteFontsSnippet } from "./build-vite-fonts-snippet";

describe("buildViteFontsSnippet", () => {
  test("uses plain family name for static fonts", () => {
    const snippet = buildViteFontsSnippet({
      familyName: "Roboto Slab",
      wghtMin: null,
      wghtMax: null,
      target: "vite",
    });
    expect(snippet).toContain(
      'plugins: [fonts("Roboto Slab", { source: "pyyupsk" })]',
    );
  });

  test("appends :variable suffix for variable fonts", () => {
    const snippet = buildViteFontsSnippet({
      familyName: "Inter",
      wghtMin: 100,
      wghtMax: 900,
      target: "vite",
    });
    expect(snippet).toContain(
      'plugins: [fonts("Inter:variable", { source: "pyyupsk" })]',
    );
  });

  test("treats equal min/max as static, not variable", () => {
    const snippet = buildViteFontsSnippet({
      familyName: "Roboto Slab",
      wghtMin: 400,
      wghtMax: 400,
      target: "vite",
    });
    expect(snippet).toContain(
      'plugins: [fonts("Roboto Slab", { source: "pyyupsk" })]',
    );
  });

  test("astro target uses /astro import and integrations key", () => {
    const snippet = buildViteFontsSnippet({
      familyName: "Inter",
      wghtMin: 100,
      wghtMax: 900,
      target: "astro",
    });
    expect(snippet).toContain('from "@pyyupsk/vite-fonts/astro"');
    expect(snippet).toContain(
      'integrations: [fonts("Inter:variable", { source: "pyyupsk" })]',
    );
  });

  test("vite target uses base import and plugins key", () => {
    const snippet = buildViteFontsSnippet({
      familyName: "Inter",
      wghtMin: null,
      wghtMax: null,
      target: "vite",
    });
    expect(snippet).toContain('from "@pyyupsk/vite-fonts"');
    expect(snippet).not.toContain("/astro");
  });
});
