import type { ParsedMetadata } from "./parse-metadata";

export interface FamilyRow {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  isNoto: boolean;
  dateAdded: string;
  sourceRepositoryUrl: string;
}

export interface VariantRow {
  id: string;
  familyId: string;
  style: string;
  weight: number;
  postScriptName: string;
}

export interface SubsetRow {
  id: string;
  name: string;
}

const CATEGORY_MAP: Record<string, string> = {
  SANS_SERIF: "sans-serif",
  SERIF: "serif",
  DISPLAY: "display",
  HANDWRITING: "handwriting",
  MONOSPACE: "monospace",
};

const LICENSE_MAP: Record<string, string> = {
  OFL: "ofl",
  APACHE2: "apache",
  UFL: "ufl",
};

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function mapFamily(metadata: ParsedMetadata): FamilyRow {
  return {
    id: slugify(metadata.name),
    name: metadata.name,
    designer: metadata.designer,
    category: CATEGORY_MAP[metadata.category] ?? "sans-serif",
    license: LICENSE_MAP[metadata.license] ?? "ofl",
    isNoto: metadata.name.startsWith("Noto "),
    dateAdded: metadata.dateAdded,
    sourceRepositoryUrl: metadata.sourceRepositoryUrl,
  };
}

export function mapVariants(metadata: ParsedMetadata, familyId: string): VariantRow[] {
  return metadata.fonts.map((font) => ({
    id: `${familyId}-${font.weight}-${font.style}`,
    familyId,
    style: font.style,
    weight: font.weight,
    postScriptName: font.postScriptName,
  }));
}

export function mapSubsets(metadata: ParsedMetadata): SubsetRow[] {
  return metadata.subsets.map((name) => ({ id: name, name }));
}
