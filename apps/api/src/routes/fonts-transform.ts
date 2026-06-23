export interface VariantWithR2Key {
  id: string;
  familyId: string;
  style: string;
  weight: number;
  postScriptName: string;
  r2Key: string;
}

export interface VariantWithFileUrl {
  id: string;
  familyId: string;
  style: string;
  weight: number;
  postScriptName: string;
  fileUrl: string;
}

export interface SubsetWithFamilyId {
  familyId: string;
  id: string;
  name: string;
}

export function buildFileUrl(publicBase: string, r2Key: string): string {
  return `${publicBase}/${r2Key}`;
}

export function toVariantWithFileUrl(
  { r2Key, ...variant }: VariantWithR2Key,
  publicBase: string,
): VariantWithFileUrl {
  return { ...variant, fileUrl: buildFileUrl(publicBase, r2Key) };
}

export function groupVariantsByFamily(
  rows: VariantWithR2Key[],
  publicBase: string,
): Map<string, VariantWithFileUrl[]> {
  const byFamily = new Map<string, VariantWithFileUrl[]>();
  for (const row of rows) {
    const list = byFamily.get(row.familyId) ?? [];
    list.push(toVariantWithFileUrl(row, publicBase));
    byFamily.set(row.familyId, list);
  }
  return byFamily;
}

export function groupSubsetsByFamily(
  rows: SubsetWithFamilyId[],
): Map<string, { id: string; name: string }[]> {
  const byFamily = new Map<string, { id: string; name: string }[]>();
  for (const { familyId, id, name } of rows) {
    const list = byFamily.get(familyId) ?? [];
    list.push({ id, name });
    byFamily.set(familyId, list);
  }
  return byFamily;
}
