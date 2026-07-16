/**
 * Rating taxonomy — the single source of truth for every dimension a café is
 * scored on. The DB schema, zod validation, forms, and UI all derive from
 * this list; add a dimension here (plus a column in db/schema.ts) and the
 * whole app picks it up.
 */
export const RATING_DIMENSIONS = [
  {
    key: "wifi",
    label: "Wi-Fi",
    hint: "Speed & stability",
  },
  {
    key: "coffee",
    label: "Coffee",
    hint: "How good is the cup",
  },
  {
    key: "outlets",
    label: "Outlets",
    hint: "Easy to plug a charger",
  },
  {
    key: "meetings",
    label: "Meetings",
    hint: "Calls & meetups friendly",
  },
] as const;

export type RatingDimension = (typeof RATING_DIMENSIONS)[number]["key"];

export const RATING_KEYS = RATING_DIMENSIONS.map((d) => d.key) as [
  RatingDimension,
  ...RatingDimension[],
];

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** A full set of per-dimension scores (what a review carries). */
export type RatingScores = Record<RatingDimension, number>;

/** Per-dimension averages — null until a café has reviews. */
export type RatingAverages = Record<RatingDimension, number | null>;

/** Mean across all dimensions of a review or of the averages; null if none set. */
export function overallScore(scores: Partial<Record<RatingDimension, number | null>>): number | null {
  const values = RATING_KEYS.map((k) => scores[k]).filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v),
  );
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Format a score like `4.3` (or an em dash when there's no data yet). */
export function formatScore(score: number | null): string {
  return score == null ? "—" : score.toFixed(1);
}

/** Quality bucket for a 1–5 score — drives pin/badge colors. */
export type ScoreTier = "high" | "mid" | "low" | "none";

export function scoreTier(score: number | null): ScoreTier {
  if (score == null) return "none";
  if (score >= 4) return "high";
  if (score >= 3) return "mid";
  return "low";
}

export const TIER_COLORS: Record<ScoreTier, string> = {
  high: "#16a34a",
  mid: "#d97706",
  low: "#dc2626",
  none: "#a8a29e",
};

/** Traffic-light color for a 1–5 score — used by map pins and badges. */
export function scoreColor(score: number | null): string {
  return TIER_COLORS[scoreTier(score)];
}
