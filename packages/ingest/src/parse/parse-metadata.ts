export interface ParsedFontEntry {
  style: string;
  weight: number;
  filename: string;
  postScriptName: string;
}

export interface ParsedMetadata {
  name: string;
  designer: string;
  license: string;
  category: string;
  dateAdded: string;
  fonts: ParsedFontEntry[];
  subsets: string[];
  sourceRepositoryUrl: string;
}

function unquote(value: string): string {
  return value.trim().replace(/^"(.*)"$/, "$1");
}

const BLOCK_OPEN = /^(\w+)\s*\{$/;

// Hand-rolled textproto parser (no JS lib supports textproto), validated against
// proto/fonts_public.proto. Block-skipping is generic by depth, not by name —
// fixes a real bug where unhandled blocks (fallbacks, sample_text, etc.) leaked
// scalar fields into the top-level result.
export function parseMetadata(text: string): ParsedMetadata {
  const lines = text.split("\n");
  const result: ParsedMetadata = {
    name: "",
    designer: "",
    license: "",
    category: "",
    dateAdded: "",
    fonts: [],
    subsets: [],
    sourceRepositoryUrl: "",
  };

  let currentFont: Partial<ParsedFontEntry> | null = null;
  let skipDepth = 0;
  let inSourceBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;

    if (currentFont) {
      if (line === "}") {
        result.fonts.push({
          style: currentFont.style ?? "normal",
          weight: currentFont.weight ?? 400,
          filename: currentFont.filename ?? "",
          postScriptName: currentFont.postScriptName ?? "",
        });
        currentFont = null;
        continue;
      }
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (!match) continue;
      const key = match[1] ?? "";
      const value = match[2] ?? "";
      if (key === "style") currentFont.style = unquote(value);
      if (key === "weight") currentFont.weight = Number(value.trim());
      if (key === "filename") currentFont.filename = unquote(value);
      if (key === "post_script_name") currentFont.postScriptName = unquote(value);
      continue;
    }

    if (skipDepth > 0) {
      if (line === "}") {
        skipDepth -= 1;
        if (skipDepth === 0) inSourceBlock = false;
        continue;
      }
      if (BLOCK_OPEN.test(line)) {
        skipDepth += 1;
        continue;
      }
      if (inSourceBlock && skipDepth === 1) {
        const match = line.match(/^repository_url:\s*(.+)$/);
        if (match) result.sourceRepositoryUrl = unquote(match[1] ?? "");
      }
      continue;
    }

    if (line === "fonts {") {
      currentFont = {};
      continue;
    }

    const blockMatch = line.match(BLOCK_OPEN);
    if (blockMatch) {
      skipDepth = 1;
      inSourceBlock = blockMatch[1] === "source";
      continue;
    }

    const topMatch = line.match(/^(\w+):\s*(.+)$/);
    if (!topMatch) continue;
    const key = topMatch[1] ?? "";
    const value = topMatch[2] ?? "";
    if (key === "name") result.name = unquote(value);
    if (key === "designer") result.designer = unquote(value);
    if (key === "license") result.license = unquote(value);
    if (key === "category") result.category = unquote(value);
    if (key === "date_added") result.dateAdded = unquote(value);
    if (key === "subsets") result.subsets.push(unquote(value));
  }

  return result;
}
