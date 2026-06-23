import { hc } from "hono/client";
import type { AppType } from "@fonts/api";
import { safe } from "./safe";

const API_BASE = import.meta.env.API_BASE;
const client = hc<AppType>(API_BASE).api.fonts;

const DEFAULT_TIMEOUT_MS = 8000;

function fetchWithTimeout(ms: number = DEFAULT_TIMEOUT_MS): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${ms}ms`)), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

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

async function fetchAllFamilyDetailsList(): Promise<FamilyDetail[]> {
  const { signal, cancel } = fetchWithTimeout();

  const [response, fetchError] = await safe(client.full.$get(undefined, { init: { signal } }));
  cancel();
  if (fetchError) {
    throw new Error(`Failed to fetch font families from ${API_BASE}: ${fetchError.message}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch font families from ${API_BASE}: ${response.status} ${response.statusText}`);
  }

  const [body, parseError] = await safe(response.json());
  if (parseError) {
    throw new Error(`Failed to parse font families response from ${API_BASE}: ${parseError.message}`);
  }

  return body.families;
}

function getAllFamilyDetailsList(): Promise<FamilyDetail[]> {
  fullCache ??= fetchAllFamilyDetailsList();
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
