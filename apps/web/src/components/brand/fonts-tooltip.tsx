import { Tooltip } from "@/components/ui/tooltip";

export function FontsTooltip() {
  return (
    <Tooltip
      delay={0}
      content="Open-license families (OFL / Apache / UFL) designed by their original authors — curated and self-hosted here, not created by pyyupsk."
      render={
        <span className="inline-block border-b-2 border-dotted border-paper-muted cursor-help transition-colors duration-fast ease-out-quart hover:border-accent hover:text-accent" />
      }
    >
      Fonts
    </Tooltip>
  );
}
