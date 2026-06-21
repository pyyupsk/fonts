export interface EmbedSnippetInput {
  apiBase: string;
  familyId: string;
  familyName: string;
  variantId: string;
  weight: number;
  style: string;
  wghtMin: number | null;
  wghtMax: number | null;
}

export function buildEmbedSnippet({ apiBase, familyId, familyName, variantId, weight, style, wghtMin, wghtMax }: EmbedSnippetInput): string {
  const isVariable = wghtMin !== null && wghtMax !== null && wghtMin < wghtMax;
  const fontWeight = isVariable ? `${wghtMin} ${wghtMax}` : weight.toString();

  return `@font-face {
  font-family: "${familyName}";
  src: url("${apiBase}/api/fonts/${familyId}/${variantId}.woff2") format("woff2");
  font-weight: ${fontWeight};
  font-style: ${style};
}`;
}
