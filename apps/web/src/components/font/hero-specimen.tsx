import { useEffect, useState } from "react";
import { loadFont } from "../../lib/load-font";

interface HeroSpecimenEntry {
  id: string;
  name: string;
  category: string;
  defaultFileUrl: string;
}

interface HeroSpecimenProps {
  entries: HeroSpecimenEntry[];
}

function pickRandom(
  entries: HeroSpecimenEntry[],
): HeroSpecimenEntry | undefined {
  return entries[Math.floor(Math.random() * entries.length)];
}

export function HeroSpecimen({ entries }: Readonly<HeroSpecimenProps>) {
  const [entry, setEntry] = useState(() => pickRandom(entries));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!entry) return;
    let isCurrent = true;
    loadFont(`hero-specimen-${entry.id}`, entry.defaultFileUrl).then((ok) => {
      if (isCurrent && ok) setLoaded(true);
    });
    return () => {
      isCurrent = false;
    };
  }, [entry]);

  if (!entry) return null;

  async function handleReroll() {
    const next = pickRandom(entries);
    if (!next) return;
    const ok = await loadFont(`hero-specimen-${next.id}`, next.defaultFileUrl);
    setLoaded(ok);
    setEntry(next);
  }

  return (
    <div>
      <p className="text-label text-paper-muted uppercase tracking-[0.08em] mb-xs">
        Random specimen
      </p>
      <a
        href={`/fonts/${entry.id}/`}
        className="block text-display font-normal leading-[0.95] tracking-[-0.02em] text-balance no-underline transition-opacity duration-fast ease-out-quart hover:text-accent focus-visible:text-accent"
        style={{
          fontFamily: `hero-specimen-${entry.id}`,
          opacity: loaded ? 1 : 0,
        }}
        aria-hidden={loaded ? undefined : true}
      >
        {entry.name}
      </a>
      <div className="flex flex-wrap items-center gap-sm mt-md">
        <p className="text-label text-paper-muted">
          <span className="font-sans text-paper">{entry.name}</span>
          <span> · {entry.category}</span>
        </p>
        <button
          type="button"
          onClick={handleReroll}
          className="flex items-center gap-xs h-9 px-sm bg-ink-raised border border-ink-border rounded text-label text-paper transition-colors duration-fast ease-out-quart hover:border-accent hover:text-accent focus-visible:border-accent"
        >
          <span aria-hidden="true">✦</span>
          Feeling lucky
        </button>
      </div>
    </div>
  );
}
