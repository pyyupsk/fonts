import { CodeBlock } from "@/components/ui/code-block";
import { Tabs } from "@/components/ui/tabs";

interface ViteFontsTabsProps {
  viteCode: string;
  viteHtml: string;
  astroCode: string;
  astroHtml: string;
}

export function ViteFontsTabs({
  viteCode,
  viteHtml,
  astroCode,
  astroHtml,
}: Readonly<ViteFontsTabsProps>) {
  return (
    <Tabs
      defaultValue="astro"
      items={[
        {
          value: "astro",
          label: "astro",
          content: <CodeBlock code={astroCode} highlightedHtml={astroHtml} />,
        },
        {
          value: "vite",
          label: "vite",
          content: <CodeBlock code={viteCode} highlightedHtml={viteHtml} />,
        },
      ]}
    />
  );
}
