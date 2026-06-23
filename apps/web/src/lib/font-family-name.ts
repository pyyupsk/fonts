export function previewFontFamilyName(
  familyId: string,
  variantId: string,
): string {
  return `preview-${familyId}-${variantId}`;
}

export function variableFontFamilyName(
  familyId: string,
  style: string,
): string {
  return `variable-${familyId}-${style}`;
}
