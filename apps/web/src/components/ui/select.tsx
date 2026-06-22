import { Select as BaseSelect } from "@base-ui/react/select";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
}

export function Select({
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
        className="h-9 flex items-center gap-xs bg-ink-raised border border-ink-border rounded text-paper font-sans text-label pl-sm pr-xs transition-colors duration-fast ease-out-quart data-popup-open:border-accent focus-visible:border-accent"
      >
        <BaseSelect.Value />
        <BaseSelect.Icon className="flex">
          <svg
            className="size-4 text-paper-muted"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} className="z-dropdown">
          <BaseSelect.Popup className="min-w-(--anchor-width) max-h-64 overflow-y-auto rounded border border-ink-border bg-ink-raised py-2xs shadow-lg">
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
}
