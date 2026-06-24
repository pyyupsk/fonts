import { useEffect, useMemo, useRef, useState } from "react";
import { FontRow } from "@/components/font/font-row";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";

const BATCH_SIZE = 10;
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
  isVariable: boolean;
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

function readListParam(name: string): string[] {
  if (globalThis.window === undefined) return [];
  const value = new URLSearchParams(globalThis.window.location.search).get(
    name,
  );
  return value ? value.split(",") : [];
}

function readBoolParam(name: string): boolean {
  if (globalThis.window === undefined) return false;
  return (
    new URLSearchParams(globalThis.window.location.search).get(name) === "1"
  );
}

function uniqueSorted<T>(values: T[], compareFn?: (a: T, b: T) => number): T[] {
  return [...new Set(values)].sort(compareFn);
}

function toOptions(values: string[]): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: value }));
}

export function CatalogFilter({ catalog }: Readonly<CatalogFilterProps>) {
  const [search, setSearch] = useState(() =>
    readParam("q") === ALL ? "" : readParam("q"),
  );
  const [category, setCategory] = useState(() => readParam("category"));
  const [license, setLicense] = useState(() => readParam("license"));
  const [style, setStyle] = useState(() => readParam("style"));
  const [selectedWeights, setSelectedWeights] = useState<string[]>(() =>
    readListParam("weight"),
  );
  const [subset, setSubset] = useState(() => readParam("subset"));
  const [variableOnly, setVariableOnly] = useState(() =>
    readBoolParam("variable"),
  );

  function toggleWeight(value: string) {
    setSelectedWeights((previous) =>
      previous.includes(value)
        ? previous.filter((entry) => entry !== value)
        : [...previous, value],
    );
  }
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== ALL) params.set("category", category);
    if (license !== ALL) params.set("license", license);
    if (style !== ALL) params.set("style", style);
    if (selectedWeights.length > 0)
      params.set("weight", selectedWeights.join(","));
    if (subset !== ALL) params.set("subset", subset);
    if (variableOnly) params.set("variable", "1");
    const queryString = params.toString();
    const url = queryString
      ? `?${queryString}`
      : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, "", url);
  }, [search, category, license, style, selectedWeights, subset, variableOnly]);

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
  const weights = useMemo(
    () =>
      uniqueSorted(
        catalog.flatMap((entry) => entry.weights),
        (a, b) => a - b,
      ),
    [catalog],
  );
  const subsets = useMemo(
    () => uniqueSorted(catalog.flatMap((entry) => entry.subsets)),
    [catalog],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((entry) => {
      if (query && !entry.name.toLowerCase().includes(query)) return false;
      if (category !== ALL && entry.category !== category) return false;
      if (license !== ALL && entry.license !== license) return false;
      if (style !== ALL && !entry.styles.includes(style)) return false;
      if (
        selectedWeights.length > 0 &&
        !entry.weights.some((entryWeight) =>
          selectedWeights.includes(String(entryWeight)),
        )
      )
        return false;
      if (subset !== ALL && !entry.subsets.includes(subset)) return false;
      if (variableOnly && !entry.isVariable) return false;
      return true;
    });
  }, [
    catalog,
    search,
    category,
    license,
    style,
    selectedWeights,
    subset,
    variableOnly,
  ]);

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
    setSelectedWeights([]);
    setSubset(ALL);
    setVariableOnly(false);
  }

  const activeFilters = [
    category !== ALL && {
      key: "category" as const,
      label: `category: ${category}`,
      clear: () => setCategory(ALL),
    },
    license !== ALL && {
      key: "license" as const,
      label: `license: ${license}`,
      clear: () => setLicense(ALL),
    },
    style !== ALL && {
      key: "style" as const,
      label: `style: ${style}`,
      clear: () => setStyle(ALL),
    },
    ...selectedWeights.map((value) => ({
      key: `weight-${value}` as const,
      label: `weight: ${value}`,
      clear: () => toggleWeight(value),
    })),
    subset !== ALL && {
      key: "subset" as const,
      label: `subset: ${subset}`,
      clear: () => setSubset(ALL),
    },
    variableOnly && {
      key: "variable" as const,
      label: "variable",
      clear: () => setVariableOnly(false),
    },
  ].filter((filter): filter is Exclude<typeof filter, false> =>
    Boolean(filter),
  );

  return (
    <div>
      <div className="sticky top-0 z-sticky bg-ink pt-md pb-sm">
        <div className="border-b border-ink-border pb-sm mb-sm">
          <Input
            ref={searchInputRef}
            className="w-full mb-sm"
            type="search"
            placeholder="Search fonts…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search fonts"
          />
          <div className="flex flex-wrap gap-lg">
            <Select
              keyLabel="category"
              ariaLabel="Category"
              value={category}
              onChange={setCategory}
              options={[{ value: ALL, label: "all" }, ...toOptions(categories)]}
            />
            <Select
              keyLabel="license"
              ariaLabel="License"
              value={license}
              onChange={setLicense}
              options={[{ value: ALL, label: "all" }, ...toOptions(licenses)]}
            />
            <Select
              keyLabel="style"
              ariaLabel="Style"
              value={style}
              onChange={setStyle}
              options={[{ value: ALL, label: "all" }, ...toOptions(styles)]}
            />
            <Select
              keyLabel="subset"
              ariaLabel="Subset"
              value={subset}
              onChange={setSubset}
              options={[{ value: ALL, label: "all" }, ...toOptions(subsets)]}
            />
            <div className="inline-flex items-baseline gap-2xs text-label text-paper-muted">
              <span>weight</span>
              <div className="inline-flex gap-xs">
                {weights.map((entryWeight) => {
                  const value = String(entryWeight);
                  return (
                    <label
                      key={value}
                      aria-disabled={variableOnly}
                      className="cursor-pointer border-b border-dotted border-paper-muted text-paper transition-colors duration-fast ease-out-quart has-data-checked:border-accent has-data-checked:text-accent hover:border-paper has-data-disabled:cursor-not-allowed has-data-disabled:text-paper-muted has-data-disabled:hover:border-paper-muted"
                    >
                      <Checkbox
                        checked={selectedWeights.includes(value)}
                        onCheckedChange={() => toggleWeight(value)}
                        disabled={variableOnly}
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
            </div>
            <label className="group inline-flex items-baseline gap-2xs cursor-pointer text-label text-paper-muted">
              <Checkbox
                checked={variableOnly}
                onCheckedChange={(checked) => {
                  setVariableOnly(checked);
                  if (checked) setSelectedWeights([]);
                }}
              />
              <Tooltip
                delay={0}
                content="Variable fonts pack a continuous weight range (e.g. 100–900) into one file, instead of separate files per weight."
                render={
                  <span className="border-b border-dotted border-paper-muted text-paper-muted transition-colors duration-fast ease-out-quart group-has-data-checked:border-accent group-has-data-checked:text-accent group-hover:text-paper" />
                }
              >
                variable
              </Tooltip>
            </label>
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
              className="flex items-center gap-2xs text-label text-paper underline transition-colors duration-fast ease-out-quart hover:text-accent"
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
          {visible.map((entry, index) => (
            <FontRow
              key={entry.id}
              familyId={entry.id}
              defaultFileUrl={entry.defaultFileUrl}
              name={entry.name}
              designer={entry.designer}
              category={entry.category}
              license={entry.license}
              index={index}
            />
          ))}
        </div>
      )}
      {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
    </div>
  );
}
