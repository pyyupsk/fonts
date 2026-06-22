import { hc } from "hono/client";
import type { AppType } from "@fonts/api";

const API_BASE = import.meta.env.API_BASE;
const client = hc<AppType>(API_BASE).api.fonts;

export interface FamilySummary {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  isNoto: boolean;
  dateAdded: string;
  sourceRepositoryUrl: string;
  wghtMin: number | null;
  wghtMax: number | null;
}

export interface FamilyVariant {
  id: string;
  familyId: string;
  style: string;
  weight: number;
  postScriptName: string;
  fileUrl: string;
}

export interface FamilySubset {
  id: string;
  name: string;
}

export interface FamilyDetail {
  family: FamilySummary;
  variants: FamilyVariant[];
  subsets: FamilySubset[];
}

let fullCache: Promise<FamilyDetail[]> | undefined;

function getAllFamilyDetailsList(): Promise<FamilyDetail[]> {
  fullCache ??= client.full.$get().then(async (response) => (await response.json()).families);
  return fullCache;
}

export async function getAllFamilies(): Promise<FamilySummary[]> {
  const details = await getAllFamilyDetailsList();
  return details.map((detail) => detail.family);
}

export async function getAllFamilyDetails(): Promise<Map<string, FamilyDetail>> {
  const details = await getAllFamilyDetailsList();
  return new Map(details.map((detail) => [detail.family.id, detail]));
}
