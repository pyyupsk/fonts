import { useEffect, useMemo, useRef, useState } from "react";
import { FontRow } from "./FontRow";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const BATCH_SIZE = 60;
const ALL = "all";

export interface CatalogEntry {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  defaultFileUrl: string;
  weights: number[];
  styles: string[];
  subsets: string[];
}

interface CatalogFilterProps {
  catalog: CatalogEntry[];
}

function readParam(name: string): string {
  if (globalThis.window === undefined) return ALL;
  return (
    new URLSearchParams(globalThis.window.location.search).get(name) ?? ALL
  );
}

export function CatalogFilter({ catalog }: Readonly<CatalogFilterProps>) {
  const [search, setSearch] = useState(() =>
    readParam("q") === ALL ? "" : readParam("q"),
  );
  const [category, setCategory] = useState(() => readParam("category"));
  const [license, setLicense] = useState(() => readParam("license"));
  const [style, setStyle] = useState(() => readParam("style"));
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== ALL) params.set("category", category);
    if (license !== ALL) params.set("license", license);
    if (style !== ALL) params.set("style", style);
    const queryString = params.toString();
    const url = queryString
      ? `?${queryString}`
      : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, "", url);
  }, [search, category, license, style]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categories = useMemo(
    () => uniqueSorted(catalog.map((entry) => entry.category)),
    [catalog],
  );
  const licenses = useMemo(
    () => uniqueSorted(catalog.map((entry) => entry.license)),
    [catalog],
  );
  const styles = useMemo(
    () => uniqueSorted(catalog.flatMap((entry) => entry.styles)),
    [catalog],
  );

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

  function clearAll() {
    setSearch("");
    setCategory(ALL);
    setLicense(ALL);
    setStyle(ALL);
  }

  const activeFilters = [
    category !== ALL && {
      key: "category" as const,
      label: category,
      clear: () => setCategory(ALL),
    },
    license !== ALL && {
      key: "license" as const,
      label: license,
      clear: () => setLicense(ALL),
    },
    style !== ALL && {
      key: "style" as const,
      label: style,
      clear: () => setStyle(ALL),
    },
  ].filter(
    (
      filter,
    ): filter is {
      key: "category" | "license" | "style";
      label: string;
      clear: () => void;
    } => Boolean(filter),
  );

  return (
    <div>
      <div className="sticky top-0 z-sticky bg-ink pt-md pb-sm">
        <div className="flex flex-wrap items-center gap-sm mb-sm">
          <Input
            ref={searchInputRef}
            className="flex-1 basis-64"
            type="search"
            placeholder="Search fonts… (press / to focus)"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search fonts"
          />
          <div className="flex flex-wrap gap-xs">
            <Select
              ariaLabel="Category"
              value={category}
              onChange={setCategory}
              options={[
                { value: ALL, label: "All categories" },
                ...toOptions(categories),
              ]}
            />
            <Select
              ariaLabel="License"
              value={license}
              onChange={setLicense}
              options={[
                { value: ALL, label: "All licenses" },
                ...toOptions(licenses),
              ]}
            />
            <Select
              ariaLabel="Style"
              value={style}
              onChange={setStyle}
              options={[
                { value: ALL, label: "All styles" },
                ...toOptions(styles),
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-xs">
          <p className="text-label text-paper-muted">
            {filtered.length.toLocaleString()} of{" "}
            {catalog.length.toLocaleString()} fonts
          </p>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.clear}
              className="flex items-center gap-2xs rounded-full border border-ink-border bg-ink-raised px-sm py-2xs text-label text-paper transition-colors duration-fast ease-out-quart hover:text-accent"
            >
              {filter.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          {(activeFilters.length > 0 || search) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-label text-paper-muted underline transition-colors duration-fast ease-out-quart hover:text-accent"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-2xl text-center">
          <p className="text-paper-muted mb-sm">
            No fonts match these filters.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="text-label text-accent underline transition-colors duration-fast ease-out-quart"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="border-t border-ink-border" role="list">
          {visible.map((entry) => (
            <FontRow
              key={entry.id}
              familyId={entry.id}
              defaultFileUrl={entry.defaultFileUrl}
              name={entry.name}
              designer={entry.designer}
              category={entry.category}
              license={entry.license}
            />
          ))}
        </div>
      )}
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
