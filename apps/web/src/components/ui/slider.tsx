import { Slider as BaseSlider } from "@base-ui/react/slider";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel: string;
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  ariaLabel,
}: Readonly<SliderProps>) {
  return (
    <BaseSlider.Root
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue)}
      min={min}
      max={max}
      step={step}
      className="w-40"
    >
      <BaseSlider.Control className="flex items-center py-xs">
        <BaseSlider.Track className="relative h-px w-full bg-ink-border">
          <BaseSlider.Indicator className="absolute h-px bg-accent" />
          <BaseSlider.Thumb
            aria-label={ariaLabel}
            className="size-3 rounded-full bg-accent transition-colors duration-fast ease-out-quart focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
