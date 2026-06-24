import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue: string;
}

export function Tabs({ items, defaultValue }: Readonly<TabsProps>) {
  return (
    <BaseTabs.Root defaultValue={defaultValue}>
      <BaseTabs.List className="flex gap-md mb-sm">
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            className="border-b border-dotted border-paper-muted text-label text-paper-muted transition-colors duration-fast ease-out-quart hover:border-paper hover:text-paper data-active:border-accent data-active:text-accent"
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel key={item.value} value={item.value}>
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
