import { useEffect, useState } from "react";
import { listFonts } from "./api";
import type { FontFamilySummary } from "./api";

interface FontListProps {
  onSelect: (familyId: string) => void;
}

export function FontList({ onSelect }: Readonly<FontListProps>) {
  const [families, setFamilies] = useState<FontFamilySummary[]>([]);

  useEffect(() => {
    listFonts().then(setFamilies);
  }, []);

  return (
    <ul>
      {families.map((family) => (
        <li key={family.id}>
          <button type="button" onClick={() => onSelect(family.id)}>
            {family.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
