import { useMemo, useState } from "react";
import { variableFontFamilyName } from "@/lib/font-family-name";
import { useFontLoaded } from "@/hooks/useFontLoaded";
import { Slider } from "@/components/ui/slider";
import { SpecimenSkeleton } from "./specimen-skeleton";

interface Variant {
  id: string;
  style: string;
  weight: number;
  fileUrl: string;
}

interface VariableFontSpecimenProps {
  familyId: string;
  variants: Variant[];
  wghtMin: number;
  wghtMax: number;
  text: string;
  size: number;
}

export function VariableFontSpecimen({
  familyId,
  variants,
  wghtMin,
  wghtMax,
  text,
  size,
}: Readonly<VariableFontSpecimenProps>) {
  const styles = useMemo(
    () => [...new Set(variants.map((variant) => variant.style))],
    [variants],
  );
  const hasWeightRange = wghtMin < wghtMax;

  const [selectedStyle, setSelectedStyle] = useState(styles[0] ?? "normal");
  const [selectedWeight, setSelectedWeight] = useState(
    hasWeightRange && wghtMin < 400 && 400 < wghtMax ? 400 : wghtMin,
  );
  const fontFamilyName = variableFontFamilyName(familyId, selectedStyle);
  const loaded = useFontLoaded(fontFamilyName, selectedWeight, selectedStyle);

  return (
    <div className="py-lg border-b border-ink-border">
      <div className="flex flex-wrap items-center gap-md mb-sm">
        {styles.length > 1 && (
          <div className="inline-flex gap-xs">
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                aria-pressed={selectedStyle === style}
                onClick={() => setSelectedStyle(style)}
                className={`border-b border-dotted text-label transition-colors duration-fast ease-out-quart ${
                  selectedStyle === style
                    ? "border-accent text-accent"
                    : "border-paper-muted text-paper-muted hover:border-paper hover:text-paper"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        )}
        {hasWeightRange ? (
          <div className="inline-flex items-center gap-xs">
            <span className="text-label text-paper-muted">weight</span>
            <Slider
              ariaLabel="Weight"
              value={selectedWeight}
              onValueChange={setSelectedWeight}
              min={wghtMin}
              max={wghtMax}
            />
            <span className="text-label text-paper-muted">
              {selectedWeight}
            </span>
          </div>
        ) : (
          <span className="text-label text-paper-muted">{wghtMin}</span>
        )}
      </div>
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0">
            <SpecimenSkeleton />
          </div>
        )}
        <pre
          className="leading-tight text-wrap transition-opacity duration-base ease-out-quart"
          style={{
            fontFamily: `"${fontFamilyName}", var(--font-sans)`,
            fontStyle: selectedStyle === "italic" ? "italic" : "normal",
            fontWeight: selectedWeight,
            fontSize: size,
            opacity: loaded ? 1 : 0,
          }}
        >
          {text}
        </pre>
      </div>
    </div>
  );
}
