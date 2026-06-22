import { useState } from "react";
import { FontPreview } from "./font-preview";
import { Textarea } from "../ui/textarea";
import { VariableFontSpecimen } from "./variable-font-specimen";

const DEFAULT_TEXT = `Everyone has the right to freedom of thought, conscience and religion; this right includes freedom to change his religion or belief, and freedom, either alone or in community with others and in public or private, to manifest his religion or belief in teaching, practice, worship and observance.

Everyone has the right to freedom of opinion and expression; this right includes freedom to hold opinions without interference and to seek, receive and impart information and ideas through any media and regardless of frontiers. Everyone has the right to rest and leisure, including reasonable limitation of working hours and periodic holidays with pay.`;

interface Variant {
  id: string;
  style: string;
  weight: number;
  fileUrl: string;
}

interface FontSpecimenListProps {
  familyId: string;
  variants: Variant[];
  wghtMin: number | null;
  wghtMax: number | null;
}

export function FontSpecimenList({
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
      <Textarea
        id="preview-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your own preview text…"
        className="w-full mb-md"
        rows={3}
      />
      {isVariable ? (
        <div className="border-t border-ink-border">
          <VariableFontSpecimen
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
              familyId={familyId}
              variantId={variant.id}
              fileUrl={variant.fileUrl}
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
