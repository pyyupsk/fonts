import { useState } from "react";

interface CodeBlockProps {
  code: string;
  highlightedHtml: string;
}

export function CodeBlock({ code, highlightedHtml }: Readonly<CodeBlockProps>) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await globalThis.window.navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative [&_.shiki]:overflow-x-auto [&_.shiki]:rounded [&_.shiki]:border [&_.shiki]:border-ink-border [&_.shiki]:p-md [&_.shiki]:pr-20 [&_.shiki]:bg-ink-raised! [&_.shiki]:text-label [&_.shiki]:font-sans">
      <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
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
