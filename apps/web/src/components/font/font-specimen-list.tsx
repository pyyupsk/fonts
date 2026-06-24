import { useState } from "react";
import { FontPreview } from "./font-preview";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { VariableFontSpecimen } from "./variable-font-specimen";

const DEFAULT_TEXT = `Everyone has the right to freedom of thought, conscience and religion; this right includes freedom to change his religion or belief, and freedom, either alone or in community with others and in public or private, to manifest his religion or belief in teaching, practice, worship and observance.

Everyone has the right to freedom of opinion and expression; this right includes freedom to hold opinions without interference and to seek, receive and impart information and ideas through any media and regardless of frontiers. Everyone has the right to rest and leisure, including reasonable limitation of working hours and periodic holidays with pay.`;

const MIN_SIZE = 16;
const MAX_SIZE = 120;
const DEFAULT_SIZE = 32;

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
  const [size, setSize] = useState(DEFAULT_SIZE);
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
        className="w-full mb-sm"
        rows={6}
      />
      <div className="inline-flex items-center gap-xs mb-md">
        <span className="text-label text-paper-muted">size</span>
        <Slider
          ariaLabel="Preview size"
          value={size}
          onValueChange={setSize}
          min={MIN_SIZE}
          max={MAX_SIZE}
        />
        <span className="text-label text-paper-muted">{size}px</span>
      </div>
      {isVariable ? (
        <div className="border-t border-ink-border">
          <VariableFontSpecimen
            familyId={familyId}
            variants={variants}
            wghtMin={wghtMin}
            wghtMax={wghtMax}
            text={text || DEFAULT_TEXT}
            size={size}
          />
        </div>
      ) : (
        <div className="border-t border-ink-border">
          {variants.map((variant) => (
            <FontPreview
              key={variant.id}
              familyId={familyId}
              variantId={variant.id}
              style={variant.style}
              weight={variant.weight}
              text={text || DEFAULT_TEXT}
              size={size}
            />
          ))}
        </div>
      )}
    </div>
  );
}
