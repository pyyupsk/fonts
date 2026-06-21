import type { InputHTMLAttributes } from "react";

type InputProps = Readonly<InputHTMLAttributes<HTMLInputElement>>;

const BASE_CLASSES =
  "bg-ink-raised border border-ink-border rounded text-paper font-body placeholder:text-paper-muted px-md py-sm transition-colors duration-fast ease-out-quart focus-visible:border-accent";

export function Input(props: InputProps) {
  return <input {...props} className={`${BASE_CLASSES} ${props.className ?? ""}`.trim()} />;
}
