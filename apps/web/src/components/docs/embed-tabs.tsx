import { CodeBlock } from "@/components/ui/code-block";
import { Tabs } from "@/components/ui/tabs";

interface EmbedTabsProps {
  staticCode: string;
  staticHtml: string;
  variableCode: string;
  variableHtml: string;
}

export function EmbedTabs({
  staticCode,
  staticHtml,
  variableCode,
  variableHtml,
}: Readonly<EmbedTabsProps>) {
  return (
    <Tabs
      defaultValue="static"
      items={[
        {
          value: "static",
          label: "static weight",
          content: <CodeBlock code={staticCode} highlightedHtml={staticHtml} />,
        },
        {
          value: "variable",
          label: "variable range",
          content: (
            <CodeBlock code={variableCode} highlightedHtml={variableHtml} />
          ),
        },
      ]}
    />
  );
}
