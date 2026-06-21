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
    <div className="relative inline-flex">
      <select
        className="appearance-none bg-ink-raised border border-ink-border rounded text-paper text-label pl-sm pr-[calc(var(--spacing-md)+var(--spacing-xs))] py-xs transition-colors duration-fast ease-out-quart focus-visible:border-accent"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-xs top-1/2 -translate-y-1/2 size-4 text-paper-muted pointer-events-none"
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
    </div>
  );
}
