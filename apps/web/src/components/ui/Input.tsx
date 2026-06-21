import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";

type InputProps = Readonly<ComponentProps<typeof BaseInput>>;

const BASE_CLASSES =
  "h-9 bg-ink-raised border border-ink-border rounded text-paper font-sans placeholder:text-paper-muted px-md transition-colors duration-fast ease-out-quart focus-visible:border-accent";

export function Input(props: InputProps) {
  return (
    <BaseInput
      {...props}
      className={`${BASE_CLASSES} ${props.className ?? ""}`.trim()}
    />
  );
}
