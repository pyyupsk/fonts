import { useEffect, useState } from "react";

interface FontPreviewProps {
  apiBase: string;
  familyId: string;
  variantId: string;
  style: string;
  weight: number;
  text: string;
}

function fontFileUrl(
  apiBase: string,
  familyId: string,
  variantId: string,
): string {
  return `${apiBase}/api/fonts/${familyId}/${variantId}.woff2`;
}

export function FontPreview({
  apiBase,
  familyId,
  variantId,
  style,
  weight,
  text,
}: Readonly<FontPreviewProps>) {
  const fontFamilyName = `preview-${familyId}-${variantId}`;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fontFace = new FontFace(
      fontFamilyName,
      `url(${fontFileUrl(apiBase, familyId, variantId)})`,
      {
        style,
        weight: weight.toString(),
      },
    );
    fontFace.load().then((loadedFace) => {
      if (!isCurrent) return;
      document.fonts.add(loadedFace);
      setLoaded(true);
    });
    return () => {
      isCurrent = false;
    };
  }, [apiBase, familyId, variantId, style, weight, fontFamilyName]);

  return (
    <div className="py-lg border-b border-ink-border">
      <p className="text-label text-paper-muted mb-xs">
        {weight} {style}
      </p>
      <p
        className="text-[clamp(1.5rem,3vw,2.5rem)] leading-tight"
        style={{
          fontFamily: loaded ? fontFamilyName : "var(--font-sans)",
          fontStyle: style === "italic" ? "italic" : "normal",
          fontWeight: weight,
        }}
      >
        {text}
      </p>
    </div>
  );
}
