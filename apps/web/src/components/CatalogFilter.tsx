import { useEffect, useMemo, useRef, useState } from "react";
import { FontRow } from "./FontRow";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const BATCH_SIZE = 60;

export interface CatalogEntry {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  defaultVariantId: string;
  weights: number[];
  styles: string[];
  subsets: string[];
}

interface CatalogFilterProps {
  apiBase: string;
  catalog: CatalogEntry[];
}

const ALL = "all";

export function CatalogFilter({ apiBase, catalog }: Readonly<CatalogFilterProps>) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [license, setLicense] = useState(ALL);
  const [style, setStyle] = useState(ALL);

  const categories = useMemo(() => uniqueSorted(catalog.map((entry) => entry.category)), [catalog]);
  const licenses = useMemo(() => uniqueSorted(catalog.map((entry) => entry.license)), [catalog]);
  const styles = useMemo(() => uniqueSorted(catalog.flatMap((entry) => entry.styles)), [catalog]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((entry) => {
      if (query && !entry.name.toLowerCase().includes(query)) return false;
      if (category !== ALL && entry.category !== category) return false;
      if (license !== ALL && entry.license !== license) return false;
      if (style !== ALL && !entry.styles.includes(style)) return false;
      return true;
    });
  }, [catalog, search, category, license, style]);

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filtered]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) => count + BATCH_SIZE);
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-sm mb-md">
        <Input
          className="flex-1 basis-64"
          type="search"
          placeholder="Search fonts…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search fonts"
        />
        <div className="flex flex-wrap gap-xs">
          <Select
            ariaLabel="Category"
            value={category}
            onChange={setCategory}
            options={[{ value: ALL, label: "All categories" }, ...toOptions(categories)]}
          />
          <Select
            ariaLabel="License"
            value={license}
            onChange={setLicense}
            options={[{ value: ALL, label: "All licenses" }, ...toOptions(licenses)]}
          />
          <Select
            ariaLabel="Style"
            value={style}
            onChange={setStyle}
            options={[{ value: ALL, label: "All styles" }, ...toOptions(styles)]}
          />
        </div>
      </div>

      <p className="text-label text-paper-muted mb-md">
        {filtered.length.toLocaleString()} of {catalog.length.toLocaleString()} fonts
      </p>

      <div className="border-t border-ink-border" role="list">
        {visible.map((entry) => (
          <FontRow
            key={entry.id}
            apiBase={apiBase}
            familyId={entry.id}
            defaultVariantId={entry.defaultVariantId}
            name={entry.name}
            designer={entry.designer}
            category={entry.category}
            license={entry.license}
          />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
    </div>
  );
}

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort();
}

function toOptions(values: string[]): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: value }));
}
