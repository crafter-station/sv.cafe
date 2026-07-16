"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { DIMENSION_ICONS } from "@/components/dimension-icon";
import { RATING_MAX, type RatingDimension } from "@/lib/ratings";
import { cn } from "@/lib/utils";

/**
 * 1–5 star picker rendered as a single aligned row (icon + label left,
 * stars right) — mirrors the read-only ratings rows. Submits through a
 * hidden input named after the dimension.
 */
export function StarInput({
  name,
  label,
  hint,
  error,
  resetKey,
  defaultValue = 0,
}: {
  name: RatingDimension;
  label: string;
  hint: string;
  error?: string;
  resetKey: number;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hovered, setHovered] = useState(0);
  // Reset stars when the parent signals a successful submit.
  const [lastReset, setLastReset] = useState(resetKey);
  if (resetKey !== lastReset) {
    setLastReset(resetKey);
    setValue(defaultValue);
  }

  const Icon = DIMENSION_ICONS[name];
  const active = hovered || value;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{label}</p>
            <p className="truncate text-[10px] leading-tight text-muted-foreground">
              {hint}
            </p>
          </div>
        </div>

        <input type="hidden" name={name} value={value} />
        <div
          role="radiogroup"
          aria-label={label}
          className="flex shrink-0"
          onMouseLeave={() => setHovered(0)}
        >
          {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`${label}: ${n} of ${RATING_MAX}`}
              onClick={() => setValue(n)}
              onMouseEnter={() => setHovered(n)}
              className="p-1 transition-transform active:scale-90"
            >
              <Star
                className={cn(
                  "size-5 transition-colors sm:size-6",
                  n <= active
                    ? "fill-foreground text-foreground"
                    : "fill-transparent text-muted-foreground/50",
                  hovered > 0 && n <= hovered && n > value && "opacity-70",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
