import { useState } from "react";
import { FontPreview } from "./FontPreview";
import { Input } from "./ui/Input";

const DEFAULT_TEXT = "The quick brown fox jumps over the lazy dog";

interface Variant {
  id: string;
  style: string;
  weight: number;
}

interface FontSpecimenListProps {
  apiBase: string;
  familyId: string;
  variants: Variant[];
}

export function FontSpecimenList({
  apiBase,
  familyId,
  variants,
}: Readonly<FontSpecimenListProps>) {
  const [text, setText] = useState(DEFAULT_TEXT);

  return (
    <div>
      <Input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your own preview text…"
        aria-label="Preview text"
        className="w-full mb-md"
      />
      <div className="border-t border-ink-border">
        {variants.map((variant) => (
          <FontPreview
            key={variant.id}
            apiBase={apiBase}
            familyId={familyId}
            variantId={variant.id}
            style={variant.style}
            weight={variant.weight}
            text={text || DEFAULT_TEXT}
          />
        ))}
      </div>
    </div>
  );
}
