export interface EmbedSnippetInput {
  familyName: string;
  fileUrl: string;
  weight: number;
  style: string;
  wghtMin: number | null;
  wghtMax: number | null;
}

export function buildEmbedSnippet({
  familyName,
  fileUrl,
  weight,
  style,
  wghtMin,
  wghtMax,
}: EmbedSnippetInput): string {
  const isVariable = wghtMin !== null && wghtMax !== null && wghtMin < wghtMax;
  const fontWeight = isVariable ? `${wghtMin} ${wghtMax}` : weight.toString();

  return `@font-face {
  font-family: "${familyName}";
  src: url("${fileUrl}") format("woff2");
  font-weight: ${fontWeight};
  font-style: ${style};
}`;
}
