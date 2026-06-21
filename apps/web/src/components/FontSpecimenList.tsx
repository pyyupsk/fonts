import { useState } from "react";
import { FontPreview } from "./FontPreview";
import { Input } from "./ui/Input";
import { VariableFontSpecimen } from "./VariableFontSpecimen";

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
  wghtMin: number | null;
  wghtMax: number | null;
}

export function FontSpecimenList({
  apiBase,
  familyId,
  variants,
  wghtMin,
  wghtMax,
}: Readonly<FontSpecimenListProps>) {
  const [text, setText] = useState(DEFAULT_TEXT);
  const isVariable = wghtMin !== null && wghtMax !== null && wghtMin < wghtMax;

  return (
    <div>
      <label
        className="block text-label text-paper-muted mb-2xs"
        htmlFor="preview-text"
      >
        Preview text
      </label>
      <Input
        id="preview-text"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your own preview text…"
        className="w-full mb-md"
      />
      {isVariable ? (
        <div className="border-t border-ink-border">
          <VariableFontSpecimen
            apiBase={apiBase}
            familyId={familyId}
            variants={variants}
            wghtMin={wghtMin}
            wghtMax={wghtMax}
            text={text || DEFAULT_TEXT}
          />
        </div>
      ) : (
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
      )}
    </div>
  );
}
