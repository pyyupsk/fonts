import { useEffect, useState } from "react";
import { previewFontFamilyName } from "../../lib/font-family-name";
import { Skeleton } from "../ui/skeleton";

interface FontPreviewProps {
  familyId: string;
  variantId: string;
  style: string;
  weight: number;
  text: string;
}

export function FontPreview({
  familyId,
  variantId,
  style,
  weight,
  text,
}: Readonly<FontPreviewProps>) {
  const fontFamilyName = previewFontFamilyName(familyId, variantId);
  const loaded = useFontLoaded(fontFamilyName, weight, style);

  return (
    <div className="py-lg border-b border-ink-border">
      <p className="text-label text-paper-muted mb-xs">
        {weight} {style}
      </p>
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0">
            <SpecimenSkeleton />
          </div>
        )}
        <p
          className="text-[clamp(1.5rem,3vw,2.5rem)] leading-tight whitespace-pre-line transition-opacity duration-base ease-out-quart"
          style={{
            fontFamily: `"${fontFamilyName}", var(--font-sans)`,
            fontStyle: style === "italic" ? "italic" : "normal",
            fontWeight: weight,
            opacity: loaded ? 1 : 0,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

const SKELETON_PARAGRAPHS = [
  ["p1-a:100%", "p1-b:100%", "p1-c:100%", "p1-d:55%"],
  ["p2-a:100%", "p2-b:90%", "p2-c:100%", "p2-d:100%", "p2-e:35%"],
];

export function SpecimenSkeleton() {
  return (
    <div className="flex flex-col gap-md py-2xs" aria-hidden="true">
      {SKELETON_PARAGRAPHS.map((lines) => (
        <div
          key={lines[0]}
          className="flex flex-col gap-sm text-[clamp(1.5rem,3vw,2.5rem)]"
        >
          {lines.map((line) => (
            <Skeleton
              key={line}
              className="h-[1em]"
              style={{ width: line.split(":")[1] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function useFontLoaded(
  fontFamilyName: string,
  weight: number,
  style: string,
): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fontStyle = style === "italic" ? "italic" : "normal";
    document.fonts
      .load(`${fontStyle} ${weight} 1em "${fontFamilyName}"`)
      .then(() => {
        if (isCurrent) setLoaded(true);
      })
      .catch(() => {
        if (isCurrent) setLoaded(true);
      });
    return () => {
      isCurrent = false;
    };
  }, [fontFamilyName, weight, style]);

  return loaded;
}
