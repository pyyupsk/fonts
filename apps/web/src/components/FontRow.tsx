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
    <a
      className="flex flex-wrap items-baseline justify-between gap-sm gap-x-lg py-md border-b border-ink-border text-paper no-underline transition-colors duration-fast ease-out-quart hover:text-accent focus-visible:text-accent"
      href={`/fonts/${familyId}/`}
      ref={rowRef}
    >
      <span
        className="text-row font-normal leading-[1.1]"
        style={{ fontFamily: loaded ? fontFamilyName : "var(--font-display)" }}
      >
        {name}
      </span>
      <span className="text-label text-paper-muted whitespace-nowrap">
        {designer} · {category} · {license}
      </span>
    </a>
  );
}
