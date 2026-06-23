import { Skeleton } from "../ui/skeleton";

const SKELETON_PARAGRAPHS = [
  ["p1-a:100%", "p1-b:100%", "p1-c:100%", "p1-d:55%"],
  ["p2-a:100%", "p2-b:90%", "p2-c:100%", "p2-d:100%", "p2-e:35%"],
];

export function SpecimenSkeleton() {
  return (
    <div className="flex flex-col gap-md py-2xs" aria-hidden="true">
      {SKELETON_PARAGRAPHS.map((lines) => (
        <div
          key={lines[0]}
          className="flex flex-col gap-sm text-[clamp(1.5rem,3vw,2.5rem)]"
        >
          {lines.map((line) => (
            <Skeleton
              key={line}
              className="h-[1em]"
              style={{ width: line.split(":")[1] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
