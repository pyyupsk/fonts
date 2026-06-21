import { useEffect, useState } from "react";
import { fontFileUrl } from "./api";
import type { FontVariantSummary } from "./api";

interface FontPreviewProps {
  familyId: string;
  variant: FontVariantSummary;
}

export function FontPreview({ familyId, variant }: Readonly<FontPreviewProps>) {
  const fontFamilyName = `preview-${familyId}-${variant.id}`;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fontFace = new FontFace(fontFamilyName, `url(${fontFileUrl(familyId, variant.id)})`, {
      style: variant.style,
      weight: variant.weight.toString(),
    });
    fontFace.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      setLoaded(true);
    });
  }, [familyId, variant.id, variant.style, variant.weight, fontFamilyName]);

  return (
    <p
      style={{
        fontFamily: loaded ? fontFamilyName : "sans-serif",
        fontStyle: variant.style === "italic" ? "italic" : "normal",
        fontWeight: variant.weight,
        fontSize: "1.5rem",
      }}
    >
      The quick brown fox jumps over the lazy dog — {variant.weight} {variant.style}
    </p>
  );
}
