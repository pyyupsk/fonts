import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = Readonly<ComponentProps<"textarea">>;

const BASE_CLASSES =
  "bg-ink-raised border border-ink-border rounded text-paper font-sans placeholder:text-paper-muted px-md py-sm transition-colors duration-fast ease-out-quart focus-visible:border-accent resize-y";

export function Textarea(props: TextareaProps) {
  return <textarea {...props} className={cn(BASE_CLASSES, props.className)} />;
}
