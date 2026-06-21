import { useEffect, useState } from "react";

interface FontPreviewProps {
  apiBase: string;
  familyId: string;
  variantId: string;
  style: string;
  weight: number;
}

function fontFileUrl(apiBase: string, familyId: string, variantId: string): string {
  return `${apiBase}/api/fonts/${familyId}/${variantId}.woff2`;
}

export function FontPreview({ apiBase, familyId, variantId, style, weight }: Readonly<FontPreviewProps>) {
  const fontFamilyName = `preview-${familyId}-${variantId}`;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fontFace = new FontFace(fontFamilyName, `url(${fontFileUrl(apiBase, familyId, variantId)})`, {
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
  }, [apiBase, familyId, variantId, style, weight, fontFamilyName]);

  return (
    <p
      style={{
        fontFamily: loaded ? fontFamilyName : "sans-serif",
        fontStyle: style === "italic" ? "italic" : "normal",
        fontWeight: weight,
        fontSize: "1.5rem",
      }}
    >
      The quick brown fox jumps over the lazy dog — {weight} {style}
    </p>
  );
}
