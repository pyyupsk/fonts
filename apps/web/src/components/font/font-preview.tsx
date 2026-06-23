import { previewFontFamilyName } from "../../lib/font-family-name";

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

  return (
    <div className="py-lg border-b border-ink-border">
      <p className="text-label text-paper-muted mb-xs">
        {weight} {style}
      </p>
      <p
        className="text-[clamp(1.5rem,3vw,2.5rem)] leading-tight whitespace-pre-line"
        style={{
          fontFamily: `"${fontFamilyName}", var(--font-sans)`,
          fontStyle: style === "italic" ? "italic" : "normal",
          fontWeight: weight,
        }}
      >
        {text}
      </p>
    </div>
  );
}
