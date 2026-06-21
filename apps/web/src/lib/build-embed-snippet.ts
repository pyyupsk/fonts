export interface EmbedSnippetInput {
  apiBase: string;
  familyId: string;
  familyName: string;
  variantId: string;
  weight: number;
  style: string;
}

export function buildEmbedSnippet({ apiBase, familyId, familyName, variantId, weight, style }: EmbedSnippetInput): string {
  return `@font-face {
  font-family: "${familyName}";
  src: url("${apiBase}/api/fonts/${familyId}/${variantId}.woff2") format("woff2");
  font-weight: ${weight};
  font-style: ${style};
}`;
}
