import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";

type InputProps = Readonly<ComponentProps<typeof BaseInput>>;

const BASE_CLASSES =
  "bg-transparent border-none text-paper font-display text-heading font-normal placeholder:text-paper-muted py-2xs outline-none";

export function Input(props: InputProps) {
  return (
    <BaseInput
      {...props}
      className={`${BASE_CLASSES} ${props.className ?? ""}`.trim()}
    />
  );
}
