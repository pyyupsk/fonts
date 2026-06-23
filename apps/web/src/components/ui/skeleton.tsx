import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

const BASE_CLASSES = "animate-pulse rounded bg-ink-raised";

export function Skeleton({ className, style }: Readonly<SkeletonProps>) {
  return (
    <div
      className={`${BASE_CLASSES} ${className ?? ""}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}
