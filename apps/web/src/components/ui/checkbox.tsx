import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Readonly<ComponentProps<typeof BaseCheckbox.Root>>;

export function Checkbox(props: CheckboxProps) {
  return (
    <BaseCheckbox.Root {...props} className={cn("sr-only", props.className)} />
  );
}
