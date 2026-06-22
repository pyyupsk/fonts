function handleBack(event: React.MouseEvent) {
  if (globalThis.window.history.length > 1 && globalThis.window.history.state) {
    event.preventDefault();
    globalThis.window.history.back();
  }
}

export function BackLink() {
  return (
    <a
      href="/"
      onClick={handleBack}
      className="inline-flex items-center gap-2xs -ml-sm -mt-xs px-sm py-xs min-h-11 text-label text-paper-muted hover:text-accent transition-colors duration-fast ease-out-quart"
    >
      <svg
        className="size-4"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M10 3L5 8l5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      back
    </a>
  );
}
