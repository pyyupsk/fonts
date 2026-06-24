import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

const BASE_CLASSES = "animate-pulse rounded bg-ink-raised";

export function Skeleton({ className, style }: Readonly<SkeletonProps>) {
  return (
    <div
      className={cn(BASE_CLASSES, className)}
      style={style}
      aria-hidden="true"
    />
  );
}
