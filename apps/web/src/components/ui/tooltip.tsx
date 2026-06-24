import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  render: ReactElement;
  delay?: number;
}

export function Tooltip({
  content,
  children,
  render,
  delay,
}: Readonly<TooltipProps>) {
  return (
    <BaseTooltip.Provider delay={delay}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={render}>{children}</BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={8} className="z-tooltip">
            <BaseTooltip.Popup className="max-w-64 rounded border border-ink-border bg-ink-raised px-sm py-xs text-label text-paper">
              <BaseTooltip.Arrow className="fill-ink-raised" />
              {content}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
