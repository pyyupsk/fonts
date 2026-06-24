import { useEffect, useRef, useState } from "react";
import { loadFont } from "@/lib/load-font";
import { Skeleton } from "@/components/ui/skeleton";

interface FontRowProps {
  familyId: string;
  defaultFileUrl: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  index: number;
}

const STAGGER_STEP_MS = 60;
const STAGGER_SLOTS = 10;

export function FontRow({
  familyId,
  defaultFileUrl,
  name,
  designer,
  category,
  license,
  index,
}: Readonly<FontRowProps>) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const [loaded, setLoaded] = useState(false);
  const fontFamilyName = `row-${familyId}`;

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;

    let isCurrent = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        loadFont(fontFamilyName, defaultFileUrl).then((ok) => {
          if (!isCurrent || !ok) return;
          setLoaded(true);
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => {
      isCurrent = false;
      observer.disconnect();
    };
  }, [defaultFileUrl, fontFamilyName]);

  const staggerDelay = `${(index % STAGGER_SLOTS) * STAGGER_STEP_MS}ms`;

  return (
    <a
      className="flex flex-wrap items-baseline justify-between gap-sm gap-x-lg py-md border-b border-ink-border text-paper no-underline transition-colors duration-fast ease-out-quart hover:text-accent focus-visible:text-accent"
      href={`/fonts/${familyId}/`}
      ref={rowRef}
    >
      <span className="relative text-row font-normal leading-[1.1]">
        {!loaded && (
          <Skeleton className="absolute inset-y-1 left-0 w-[8em] max-w-full" />
        )}
        <span
          className="transition-[opacity,transform] duration-base ease-out-quart"
          style={{
            fontFamily: fontFamilyName,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(0.5rem)",
            transitionDelay: loaded ? staggerDelay : "0ms",
          }}
        >
          {name}
        </span>
      </span>
      <span className="text-label text-paper-muted whitespace-nowrap">
        {designer} · {category} · {license}
      </span>
    </a>
  );
}
