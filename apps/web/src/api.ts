const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

export interface FontFamilySummary {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  isNoto: boolean;
  dateAdded: string;
  sourceRepositoryUrl: string;
}

export interface FontVariantSummary {
  id: string;
  familyId: string;
  style: string;
  weight: number;
  postScriptName: string;
}

export interface SubsetSummary {
  id: string;
  name: string;
}

export interface FontFamilyDetail {
  family: FontFamilySummary;
  variants: FontVariantSummary[];
  subsets: SubsetSummary[];
}

export async function listFonts(): Promise<FontFamilySummary[]> {
  const response = await fetch(`${API_BASE}/api/fonts`);
  const data = (await response.json()) as { families: FontFamilySummary[] };
  return data.families;
}

export async function getFontFamily(familyId: string): Promise<FontFamilyDetail> {
  const response = await fetch(`${API_BASE}/api/fonts/${familyId}`);
  return (await response.json()) as FontFamilyDetail;
}

export function fontFileUrl(familyId: string, variantId: string): string {
  return `${API_BASE}/api/fonts/${familyId}/${variantId}.woff2`;
}
