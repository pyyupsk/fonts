import { useEffect, useRef, useState } from "react";

interface FontRowProps {
  apiBase: string;
  familyId: string;
  defaultVariantId: string;
  name: string;
  designer: string;
  category: string;
  license: string;
}

export function FontRow({
  apiBase,
  familyId,
  defaultVariantId,
  name,
  designer,
  category,
  license,
}: Readonly<FontRowProps>) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const [loaded, setLoaded] = useState(false);
  const fontFamilyName = `row-${familyId}`;

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const fontFace = new FontFace(
          fontFamilyName,
          `url(${apiBase}/api/fonts/${familyId}/${defaultVariantId}.woff2)`,
        );
        fontFace.load().then((loadedFace) => {
          document.fonts.add(loadedFace);
          setLoaded(true);
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [apiBase, familyId, defaultVariantId, fontFamilyName]);

  return (
    <a className="font-row" href={`/fonts/${familyId}/`} ref={rowRef}>
      <span
        className="font-row__name"
        style={{ fontFamily: loaded ? fontFamilyName : "var(--font-display)" }}
      >
        {name}
      </span>
      <span className="font-row__meta">
        {designer} · {category} · {license}
      </span>
    </a>
  );
}
