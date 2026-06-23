import { useEffect, useState } from "react";

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
