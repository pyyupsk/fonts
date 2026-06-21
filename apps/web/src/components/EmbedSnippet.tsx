import { useState } from "react";

interface EmbedSnippetProps {
  apiBase: string;
  familyId: string;
  familyName: string;
  variantId: string;
  weight: number;
  style: string;
}

function buildSnippet({
  apiBase,
  familyId,
  familyName,
  variantId,
  weight,
  style,
}: EmbedSnippetProps): string {
  return `@font-face {
  font-family: "${familyName}";
  src: url("${apiBase}/api/fonts/${familyId}/${variantId}.woff2") format("woff2");
  font-weight: ${weight};
  font-style: ${style};
}`;
}

export function EmbedSnippet(props: Readonly<EmbedSnippetProps>) {
  const [copied, setCopied] = useState(false);
  const snippet = buildSnippet(props);

  async function handleCopy() {
    await globalThis.window.navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded border border-ink-border bg-ink-raised p-md pr-20 text-label font-sans text-paper-muted">
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-md right-md text-label text-paper-muted hover:text-accent transition-colors duration-fast ease-out-quart"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
