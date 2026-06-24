export type ViteFontsTarget = "vite" | "astro";

export interface ViteFontsSnippetInput {
  familyName: string;
  wghtMin: number | null;
  wghtMax: number | null;
  target: ViteFontsTarget;
}

const TARGETS: Record<
  ViteFontsTarget,
  { configFile: string; importPath: string; key: string }
> = {
  vite: {
    configFile: "vite.config.ts",
    importPath: "@pyyupsk/vite-fonts",
    key: "plugins",
  },
  astro: {
    configFile: "astro.config.ts",
    importPath: "@pyyupsk/vite-fonts/astro",
    key: "integrations",
  },
};

export function buildViteFontsSnippet({
  familyName,
  wghtMin,
  wghtMax,
  target,
}: ViteFontsSnippetInput): string {
  const isVariable = wghtMin !== null && wghtMax !== null && wghtMin < wghtMax;
  const family = isVariable ? `${familyName}:variable` : familyName;
  const { configFile, importPath, key } = TARGETS[target];

  return `// ${configFile}
import { fonts } from "${importPath}";

export default defineConfig({
  ${key}: [fonts("${family}", { source: "pyyupsk" })],
});`;
}
