import { useEffect, useMemo, useRef, useState } from "react";
import { FontRow } from "./FontRow";

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
    <div className="catalog">
      <div className="catalog__controls">
        <input
          className="catalog__search"
          type="search"
          placeholder="Search fonts…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search fonts"
        />
        <div className="catalog__filters">
          <select
            className="catalog__select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Category"
          >
            <option value={ALL}>All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="catalog__select"
            value={license}
            onChange={(event) => setLicense(event.target.value)}
            aria-label="License"
          >
            <option value={ALL}>All licenses</option>
            {licenses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="catalog__select"
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            aria-label="Style"
          >
            <option value={ALL}>All styles</option>
            {styles.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="catalog__count">
        {filtered.length.toLocaleString()} of {catalog.length.toLocaleString()} fonts
      </p>

      <div className="catalog__list" role="list">
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
      {hasMore && <div ref={sentinelRef} className="catalog__sentinel" aria-hidden="true" />}
    </div>
  );
}

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort();
}
