import { avg, count, desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { cafes, reviews } from "@/db/schema";
import type { RatingAverages } from "@/lib/ratings";

/** drizzle `avg()` returns a numeric string (or null) — normalize to number. */
function toScore(value: string | null): number | null {
  return value == null ? null : Number(value);
}

const ratingAggregates = {
  reviewCount: count(reviews.id),
  wifi: avg(reviews.wifi),
  coffee: avg(reviews.coffee),
  outlets: avg(reviews.outlets),
  meetings: avg(reviews.meetings),
};

function shapeRatings(row: {
  reviewCount: number;
  wifi: string | null;
  coffee: string | null;
  outlets: string | null;
  meetings: string | null;
}): { reviewCount: number; ratings: RatingAverages } {
  return {
    reviewCount: row.reviewCount,
    ratings: {
      wifi: toScore(row.wifi),
      coffee: toScore(row.coffee),
      outlets: toScore(row.outlets),
      meetings: toScore(row.meetings),
    },
  };
}

/** All cafés with review counts and per-dimension average ratings. */
export async function listCafes() {
  const rows = await db
    .select({ ...getTableColumns(cafes), ...ratingAggregates })
    .from(cafes)
    .leftJoin(reviews, eq(reviews.cafeId, cafes.id))
    .groupBy(cafes.id)
    .orderBy(cafes.name);

  return rows.map(({ reviewCount, wifi, coffee, outlets, meetings, ...cafe }) => ({
    ...cafe,
    ...shapeRatings({ reviewCount, wifi, coffee, outlets, meetings }),
  }));
}

export type CafeWithRatings = Awaited<ReturnType<typeof listCafes>>[number];

/**
 * All cafés + all reviews in two queries, reviews grouped per café.
 * The whole dataset ships to the client so drawers/⌘K open with zero fetches.
 */
export async function listCafesWithReviews() {
  const [cafeRows, reviewRows] = await Promise.all([
    listCafes(),
    db.select().from(reviews).orderBy(desc(reviews.createdAt)),
  ]);

  const byCafe = new Map<string, typeof reviewRows>();
  for (const r of reviewRows) {
    const bucket = byCafe.get(r.cafeId);
    if (bucket) bucket.push(r);
    else byCafe.set(r.cafeId, [r]);
  }

  return cafeRows.map((cafe) => ({
    ...cafe,
    reviews: byCafe.get(cafe.id) ?? [],
  }));
}

export type CafeFull = Awaited<
  ReturnType<typeof listCafesWithReviews>
>[number];

/** One café by slug, with its aggregates and full review list (newest first). */
export async function getCafeBySlug(slug: string) {
  const [row] = await db
    .select({ ...getTableColumns(cafes), ...ratingAggregates })
    .from(cafes)
    .leftJoin(reviews, eq(reviews.cafeId, cafes.id))
    .where(eq(cafes.slug, slug))
    .groupBy(cafes.id)
    .limit(1);

  if (!row) return null;

  const cafeReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.cafeId, row.id))
    .orderBy(desc(reviews.createdAt));

  const { reviewCount, wifi, coffee, outlets, meetings, ...cafe } = row;
  return {
    ...cafe,
    ...shapeRatings({ reviewCount, wifi, coffee, outlets, meetings }),
    reviews: cafeReviews,
  };
}

export type CafeDetail = NonNullable<Awaited<ReturnType<typeof getCafeBySlug>>>;
