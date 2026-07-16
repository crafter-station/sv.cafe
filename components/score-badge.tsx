import { formatScore, scoreColor } from "@/lib/ratings";
import { cn } from "@/lib/utils";

/**
 * Flat, mono-numeral score chip — midday style. The only color is a small
 * status dot (traffic-light by score); everything else stays monochrome.
 */
export function ScoreBadge({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 border bg-background font-mono tabular-nums",
        size === "md" ? "h-8 px-2.5 text-sm" : "h-10 px-3 text-base",
      )}
    >
      <span
        aria-hidden
        className="size-1.5"
        style={{ backgroundColor: scoreColor(score) }}
      />
      {formatScore(score)}
    </span>
  );
}
