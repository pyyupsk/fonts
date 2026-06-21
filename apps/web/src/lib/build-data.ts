import { hc } from "hono/client";
import type { AppType } from "@fonts/api";
import { runWithConcurrency } from "./run-with-concurrency";

const API_BASE = import.meta.env.API_BASE;
const client = hc<AppType>(API_BASE).api.fonts;

const DETAIL_CONCURRENCY = 20;

export interface FamilySummary {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  isNoto: boolean;
  dateAdded: string;
  sourceRepositoryUrl: string;
}

export interface FamilyVariant {
  id: string;
  familyId: string;
  style: string;
  weight: number;
  postScriptName: string;
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

export async function getAllFamilies(): Promise<FamilySummary[]> {
  const response = await client.$get();
  const data = await response.json();
  return data.families;
}

export async function getFamilyDetail(familyId: string): Promise<FamilyDetail | undefined> {
  const response = await client[":family"].$get({ param: { family: familyId } });
  if (response.status === 404) return undefined;
  return (await response.json()) as FamilyDetail;
}

export async function getAllFamilyDetails(
  families: FamilySummary[],
): Promise<Map<string, FamilyDetail>> {
  const details = new Map<string, FamilyDetail>();

  await runWithConcurrency(families, DETAIL_CONCURRENCY, async (family) => {
    const detail = await getFamilyDetail(family.id);
    if (detail) details.set(family.id, detail);
  });

  return details;
}
