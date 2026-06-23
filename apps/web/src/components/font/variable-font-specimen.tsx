import { useEffect, useMemo, useState } from "react";
import { loadFont } from "../../lib/load-font";

const WEIGHT_STOPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

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
}

export function VariableFontSpecimen({
  familyId,
  variants,
  wghtMin,
  wghtMax,
  text,
}: Readonly<VariableFontSpecimenProps>) {
  const styles = useMemo(
    () => [...new Set(variants.map((variant) => variant.style))],
    [variants],
  );
  const weightStops = useMemo(
    () => WEIGHT_STOPS.filter((stop) => stop >= wghtMin && stop <= wghtMax),
    [wghtMin, wghtMax],
  );

  const [selectedStyle, setSelectedStyle] = useState(styles[0] ?? "normal");
  const [selectedWeight, setSelectedWeight] = useState(
    weightStops.includes(400) ? 400 : (weightStops[0] ?? wghtMin),
  );
  const [loadedStyle, setLoadedStyle] = useState<string | null>(null);

  const fontFamilyName = `variable-${familyId}-${selectedStyle}`;

  useEffect(() => {
    const variant = variants.find((entry) => entry.style === selectedStyle);
    if (!variant) return;

    let isCurrent = true;
    loadFont(fontFamilyName, variant.fileUrl, {
      style: selectedStyle,
      weight: `${wghtMin} ${wghtMax}`,
    }).then((ok) => {
      if (!isCurrent || !ok) return;
      setLoadedStyle(selectedStyle);
    });
    return () => {
      isCurrent = false;
    };
  }, [variants, selectedStyle, wghtMin, wghtMax, fontFamilyName]);

  return (
    <div className="py-lg border-b border-ink-border">
      <div className="flex flex-wrap items-center gap-md mb-sm">
        {styles.length > 1 && (
          <div className="flex gap-2xs">
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`rounded-full border px-sm py-2xs text-label transition-colors duration-fast ease-out-quart ${
                  selectedStyle === style
                    ? "border-accent text-accent"
                    : "border-ink-border text-paper-muted hover:text-paper"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2xs">
          {weightStops.map((weight) => (
            <button
              key={weight}
              type="button"
              onClick={() => setSelectedWeight(weight)}
              className={`rounded-full border px-sm py-2xs text-label transition-colors duration-fast ease-out-quart ${
                selectedWeight === weight
                  ? "border-accent text-accent"
                  : "border-ink-border text-paper-muted hover:text-paper"
              }`}
            >
              {weight}
            </button>
          ))}
        </div>
      </div>
      <pre
        className="text-[clamp(1.5rem,3vw,2.5rem)] leading-tight text-wrap"
        style={{
          fontFamily:
            loadedStyle === selectedStyle ? fontFamilyName : "var(--font-sans)",
          fontStyle: selectedStyle === "italic" ? "italic" : "normal",
          fontWeight: selectedWeight,
        }}
      >
        {text}
      </pre>
    </div>
  );
}
