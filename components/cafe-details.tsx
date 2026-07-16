"use client";

import { MapPin } from "lucide-react";
import { DIMENSION_ICONS } from "@/components/dimension-icon";
import { ReviewForm } from "@/components/review-form";
import { ScoreBadge } from "@/components/score-badge";
import { WifiCard } from "@/components/wifi-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CafeFull } from "@/db/queries";
import {
  formatScore,
  overallScore,
  RATING_DIMENSIONS,
  RATING_MAX,
} from "@/lib/ratings";

const dateFormat = new Intl.DateTimeFormat("en-SV", { dateStyle: "medium" });

/** Full café dossier — rendered inside the drawer and on /cafes/[slug]. */
export function CafeDetails({
  cafe,
  deviceId,
}: {
  cafe: CafeFull;
  deviceId: string | null;
}) {
  const myReview =
    deviceId == null
      ? null
      : (cafe.reviews.find((r) => r.deviceId === deviceId) ?? null);

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{cafe.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {cafe.area}
            {cafe.address ? ` · ${cafe.address}` : ""}
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {cafe.reviewCount} review{cafe.reviewCount === 1 ? "" : "s"}
          </p>
        </div>
        <ScoreBadge score={overallScore(cafe.ratings)} size="lg" />
      </section>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="font-mono text-xs uppercase tracking-[0.12em]">
            Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {RATING_DIMENSIONS.map((d) => {
            const Icon = DIMENSION_ICONS[d.key];
            const score = cafe.ratings[d.key];
            const pct = score == null ? 0 : (score / RATING_MAX) * 100;
            return (
              <div key={d.key} className="flex items-center gap-3">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="w-24 shrink-0">
                  <p className="text-sm font-medium leading-tight">{d.label}</p>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    {d.hint}
                  </p>
                </div>
                <div className="h-1.5 flex-1 bg-secondary">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-9 text-right font-mono text-sm tabular-nums">
                  {formatScore(score)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <WifiCard wifiName={cafe.wifiName} wifiPassword={cafe.wifiPassword} />

      <Card size="sm">
        <CardHeader>
          <CardTitle className="font-mono text-xs uppercase tracking-[0.12em]">
            {myReview ? "Your review" : "Leave a review"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm
            key={myReview?.id ?? "new"}
            cafeId={cafe.id}
            existingReview={myReview}
          />
        </CardContent>
      </Card>

      <section>
        <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Reviews
        </h3>
        <div className="mt-3 border">
          {cafe.reviews.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Be the first to review this café.
            </p>
          ) : (
            cafe.reviews.map((review, i) => (
              <article key={review.id}>
                {i > 0 ? <Separator /> : null}
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {review.author}
                      {deviceId != null && review.deviceId === deviceId ? (
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                          You
                        </Badge>
                      ) : null}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {dateFormat.format(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RATING_DIMENSIONS.map((d) => {
                      const Icon = DIMENSION_ICONS[d.key];
                      return (
                        <span
                          key={d.key}
                          title={d.label}
                          className="inline-flex items-center gap-1 border bg-background px-1.5 py-0.5 font-mono text-xs tabular-nums"
                        >
                          <Icon className="size-3 text-muted-foreground" />
                          {review[d.key]}
                        </span>
                      );
                    })}
                  </div>
                  {review.comment ? (
                    <p className="text-sm text-foreground/90">
                      {review.comment}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
