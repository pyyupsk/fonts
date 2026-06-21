import { useEffect, useState } from "react";

interface FontPreviewProps {
  apiBase: string;
  familyId: string;
  variantId: string;
  style: string;
  weight: number;
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
    <p
      style={{
        fontFamily: loaded ? fontFamilyName : "sans-serif",
        fontStyle: style === "italic" ? "italic" : "normal",
        fontWeight: weight,
        fontSize: "1.5rem",
      }}
    >
      Everyone has the right to freedom of thought, conscience and religion;
      this right includes freedom to change his religion or belief, and freedom,
      either alone or in community with others and in public or private, to
      manifest his religion or belief in teaching, practice, worship and
      observance. Everyone has the right to freedom of opinion and expression;
      this right includes freedom to hold opinions without interference and to
      seek, receive and impart information and ideas through any media and
      regardless of frontiers. Everyone has the right to rest and leisure,
      including reasonable limitation of working hours and periodic holidays
      with pay.
    </p>
  );
}
