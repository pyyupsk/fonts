import { useState } from "react";
import { FamilyDetail } from "./FamilyDetail";
import { FontList } from "./FontList";

export function App() {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  return (
    <main>
      <h1>Fonts</h1>
      {selectedFamilyId ? (
        <FamilyDetail familyId={selectedFamilyId} onBack={() => setSelectedFamilyId(null)} />
      ) : (
        <FontList onSelect={setSelectedFamilyId} />
      )}
    </main>
  );
}
