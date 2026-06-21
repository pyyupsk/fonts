import { useMemo, useState } from "react";

export interface CatalogEntry {
  id: string;
  name: string;
  designer: string;
  category: string;
  license: string;
  weights: number[];
  styles: string[];
  subsets: string[];
}

interface CatalogFilterProps {
  catalog: CatalogEntry[];
}

const ALL = "all";

export function CatalogFilter({ catalog }: Readonly<CatalogFilterProps>) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [license, setLicense] = useState(ALL);
  const [weight, setWeight] = useState(ALL);
  const [style, setStyle] = useState(ALL);
  const [subset, setSubset] = useState(ALL);

  const categories = useMemo(
    () => uniqueSorted(catalog.map((entry) => entry.category)),
    [catalog],
  );
  const licenses = useMemo(
    () => uniqueSorted(catalog.map((entry) => entry.license)),
    [catalog],
  );
  const weights = useMemo(
    () =>
      uniqueSorted(catalog.flatMap((entry) => entry.weights)).sort(
        (a, b) => Number(a) - Number(b),
      ),
    [catalog],
  );
  const styles = useMemo(
    () => uniqueSorted(catalog.flatMap((entry) => entry.styles)),
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
      if (weight !== ALL && !entry.weights.includes(Number(weight)))
        return false;
      if (style !== ALL && !entry.styles.includes(style)) return false;
      if (subset !== ALL && !entry.subsets.includes(subset)) return false;
      return true;
    });
  }, [catalog, search, category, license, weight, style, subset]);

  return (
    <div>
      <input
        type="search"
        placeholder="Search fonts…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search fonts"
      />
      <select
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
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        aria-label="Weight"
      >
        <option value={ALL}>All weights</option>
        {weights.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <select
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
      <select
        value={subset}
        onChange={(event) => setSubset(event.target.value)}
        aria-label="Subset"
      >
        <option value={ALL}>All subsets</option>
        {subsets.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <p>{filtered.length} fonts</p>
      <ul>
        {filtered.map((entry) => (
          <li key={entry.id}>
            <a href={`/fonts/${entry.id}/`}>{entry.name}</a> — {entry.designer}{" "}
            · {entry.category} · {entry.license}
          </li>
        ))}
      </ul>
    </div>
  );
}

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort();
}
