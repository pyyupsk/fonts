import { useEffect, useState } from "react";

interface FontPreviewProps {
  familyId: string;
  variantId: string;
  fileUrl: string;
  style: string;
  weight: number;
  text: string;
}

export function FontPreview({
  familyId,
  variantId,
  fileUrl,
  style,
  weight,
  text,
}: Readonly<FontPreviewProps>) {
  const fontFamilyName = `preview-${familyId}-${variantId}`;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fontFace = new FontFace(fontFamilyName, `url(${fileUrl})`, {
      style,
      weight: weight.toString(),
    });
    fontFace.load().then((loadedFace) => {
      if (!isCurrent) return;
      document.fonts.add(loadedFace);
      setLoaded(true);
    });
    return () => {
      isCurrent = false;
    };
  }, [fileUrl, style, weight, fontFamilyName]);

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
