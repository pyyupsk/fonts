import { previewFontFamilyName } from "@/lib/font-family-name";
import { useFontLoaded } from "@/hooks/useFontLoaded";
import { SpecimenSkeleton } from "./specimen-skeleton";

interface FontPreviewProps {
  familyId: string;
  variantId: string;
  style: string;
  weight: number;
  text: string;
  size: number;
}

export function FontPreview({
  familyId,
  variantId,
  style,
  weight,
  text,
  size,
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
          className="leading-tight whitespace-pre-line transition-opacity duration-base ease-out-quart"
          style={{
            fontFamily: `"${fontFamilyName}", var(--font-sans)`,
            fontStyle: style === "italic" ? "italic" : "normal",
            fontWeight: weight,
            fontSize: size,
            opacity: loaded ? 1 : 0,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
