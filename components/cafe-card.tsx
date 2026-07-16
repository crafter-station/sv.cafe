"use client";

import { Wifi } from "lucide-react";
import { DIMENSION_ICONS } from "@/components/dimension-icon";
import { ScoreBadge } from "@/components/score-badge";
import type { CafeWithRatings } from "@/db/queries";
import { formatScore, overallScore, RATING_DIMENSIONS } from "@/lib/ratings";
import { cn } from "@/lib/utils";

export function CafeCard({
  cafe,
  selected,
  onSelect,
}: {
  cafe: CafeWithRatings;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "block w-full border bg-card text-left transition-colors hover:bg-accent",
        selected && "border-foreground",
      )}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{cafe.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {cafe.area}
          </p>
        </div>
        <ScoreBadge score={overallScore(cafe.ratings)} />
      </div>

      <div className="grid grid-cols-4 divide-x border-t">
        {RATING_DIMENSIONS.map((d) => {
          const Icon = DIMENSION_ICONS[d.key];
          return (
            <span
              key={d.key}
              title={d.label}
              className="flex items-center justify-center gap-1.5 px-1 py-2 font-mono text-xs tabular-nums"
            >
              <Icon className="size-3.5 text-muted-foreground" />
              {formatScore(cafe.ratings[d.key])}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {cafe.reviewCount} review{cafe.reviewCount === 1 ? "" : "s"}
        </span>
        {cafe.wifiName ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <Wifi className="size-3" /> Wi-Fi shared
          </span>
        ) : null}
      </div>
    </button>
  );
}
