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
  let inSourceBlock = false;
  let braceDepth = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;

    if (line.startsWith("fonts {")) {
      currentFont = {};
      continue;
    }

    if (line.startsWith("source {")) {
      inSourceBlock = true;
      braceDepth = 1;
      continue;
    }

    if (line.startsWith("axes {")) {
      braceDepth += 1;
      continue;
    }

    if (line === "}") {
      if (currentFont) {
        result.fonts.push({
          style: currentFont.style ?? "normal",
          weight: currentFont.weight ?? 400,
          filename: currentFont.filename ?? "",
          postScriptName: currentFont.postScriptName ?? "",
        });
        currentFont = null;
        continue;
      }
      if (braceDepth > 0) {
        braceDepth -= 1;
        if (braceDepth === 0) inSourceBlock = false;
        continue;
      }
      continue;
    }

    if (currentFont || braceDepth > 0) {
      if (currentFont) {
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
      if (inSourceBlock && braceDepth === 1) {
        const match = line.match(/^repository_url:\s*(.+)$/);
        if (match) result.sourceRepositoryUrl = unquote(match[1] ?? "");
      }
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
