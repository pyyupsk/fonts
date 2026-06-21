import { useEffect, useState } from "react";
import { getFontFamily } from "./api";
import type { FontFamilyDetail } from "./api";
import { FontPreview } from "./FontPreview";

interface FamilyDetailProps {
  familyId: string;
  onBack: () => void;
}

export function FamilyDetail({
  familyId,
  onBack,
}: Readonly<FamilyDetailProps>) {
  const [detail, setDetail] = useState<FontFamilyDetail | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getFontFamily(familyId).then((result) => {
      if (isCurrent) setDetail(result);
    });
    return () => {
      isCurrent = false;
    };
  }, [familyId]);

  if (detail?.family.id !== familyId) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <button type="button" onClick={onBack}>
        ← back
      </button>
      <h2>{detail.family.name}</h2>
      <p>
        {detail.family.designer} · {detail.family.category} ·{" "}
        {detail.family.license}
      </p>
      <p>Subsets: {detail.subsets.map((subset) => subset.name).join(", ")}</p>
      {detail.variants.map((variant) => (
        <FontPreview key={variant.id} familyId={familyId} variant={variant} />
      ))}
    </div>
  );
}
