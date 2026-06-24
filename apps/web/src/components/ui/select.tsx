import { Select as BaseSelect } from "@base-ui/react/select";
import { memo } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  keyLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
}

export const Select = memo(function Select({
  keyLabel,
  value,
  onChange,
  options,
  ariaLabel,
}: Readonly<SelectProps>) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as string)}
      items={options}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className="group inline-flex items-baseline gap-2xs text-label text-paper-muted cursor-pointer transition-colors duration-fast ease-out-quart hover:text-paper data-popup-open:text-accent focus-visible:text-accent"
      >
        <span>{keyLabel}</span>
        <span className="border-b border-dotted border-paper-muted text-paper transition-colors duration-fast ease-out-quart group-hover:border-paper group-data-popup-open:border-accent group-data-popup-open:text-accent">
          <BaseSelect.Value />
        </span>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          alignItemWithTrigger={false}
          sideOffset={4}
          className="z-dropdown"
        >
          <BaseSelect.Popup className="min-w-(--anchor-width) max-h-64 overflow-y-auto rounded border border-ink-border bg-ink-raised py-2xs">
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="flex items-center justify-between gap-xs cursor-pointer whitespace-nowrap px-sm py-xs text-label font-sans text-paper transition-colors duration-fast ease-out-quart data-highlighted:bg-ink data-highlighted:text-accent outline-none"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
});
