import { describe, expect, test } from "bun:test";
import { parseMetadata } from "./parse-metadata";

describe("parseMetadata", () => {
  test("parses top-level scalar fields", () => {
    const result = parseMetadata(`
name: "Roboto Slab"
designer: "Christian Robertson"
license: "OFL"
category: "SERIF"
date_added: "2014-12-01"
`);
    expect(result.name).toBe("Roboto Slab");
    expect(result.designer).toBe("Christian Robertson");
    expect(result.license).toBe("OFL");
    expect(result.category).toBe("SERIF");
    expect(result.dateAdded).toBe("2014-12-01");
  });

  test("parses repeated subsets", () => {
    const result = parseMetadata(`
subsets: "latin"
subsets: "cyrillic"
`);
    expect(result.subsets).toEqual(["latin", "cyrillic"]);
  });

  test("parses fonts block", () => {
    const result = parseMetadata(`
fonts {
  name: "Roboto Slab"
  style: "normal"
  weight: 400
  filename: "RobotoSlab-Regular.ttf"
  post_script_name: "RobotoSlab-Regular"
}
`);
    expect(result.fonts).toEqual([
      {
        style: "normal",
        weight: 400,
        filename: "RobotoSlab-Regular.ttf",
        postScriptName: "RobotoSlab-Regular",
      },
    ]);
  });

  test("parses axes block", () => {
    const result = parseMetadata(`
axes {
  tag: "wght"
  min_value: 100
  max_value: 900
}
`);
    expect(result.axes).toEqual([
      { tag: "wght", minValue: 100, maxValue: 900 },
    ]);
  });

  test("extracts repository_url from source block only", () => {
    const result = parseMetadata(`
source {
  repository_url: "https://github.com/google/fonts"
}
`);
    expect(result.sourceRepositoryUrl).toBe("https://github.com/google/fonts");
  });

  test("skips unhandled nested blocks without leaking fields into top level", () => {
    const result = parseMetadata(`
name: "Roboto Slab"
fallbacks {
  name: "fallback"
  weight: 999
}
sample_text {
  text_type: "name"
}
`);
    expect(result.name).toBe("Roboto Slab");
    expect(
      (result as unknown as Record<string, unknown>).weight,
    ).toBeUndefined();
    expect(
      (result as unknown as Record<string, unknown>).text_type,
    ).toBeUndefined();
  });

  test("ignores blank lines and comments", () => {
    const result = parseMetadata(`
# this is a comment
name: "Roboto Slab"

# another comment
designer: "Christian Robertson"
`);
    expect(result.name).toBe("Roboto Slab");
    expect(result.designer).toBe("Christian Robertson");
  });
});
