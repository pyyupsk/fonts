import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps } from "react";

type CheckboxProps = Readonly<ComponentProps<typeof BaseCheckbox.Root>>;

export function Checkbox(props: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      {...props}
      className={`sr-only ${props.className ?? ""}`.trim()}
    />
  );
}
