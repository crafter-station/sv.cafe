import { sql } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * cafes — one row per café in El Salvador.
 *
 * Wi-Fi credentials are community-shared on purpose (that's the product):
 * the network name is always visible, the password sits behind a reveal
 * button in the UI but is not a secret.
 */
export const cafes = pgTable(
  "cafes",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    // Neighborhood / city shown as the short location line (e.g. "San Benito, San Salvador").
    area: text("area").notNull(),
    address: text("address"),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    wifiName: text("wifi_name"),
    wifiPassword: text("wifi_password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("cafes_slug_idx").on(t.slug)],
);

/**
 * reviews — one row per visitor review. Each review scores every rating
 * dimension (1–5); columns mirror lib/ratings.ts RATING_DIMENSIONS.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    cafeId: text("cafe_id")
      .notNull()
      .references(() => cafes.id, { onDelete: "cascade" }),
    // Anonymous device identity (httpOnly cookie, fingerprint fallback).
    // One review per device per café; lets a device edit its own review.
    deviceId: text("device_id"),
    author: text("author").notNull(),
    comment: text("comment"),
    wifi: integer("wifi").notNull(),
    coffee: integer("coffee").notNull(),
    outlets: integer("outlets").notNull(),
    meetings: integer("meetings").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("reviews_cafe_id_idx").on(t.cafeId),
    uniqueIndex("reviews_cafe_device_uidx")
      .on(t.cafeId, t.deviceId)
      .where(sql`${t.deviceId} is not null`),
  ],
);

export type Cafe = typeof cafes.$inferSelect;
export type NewCafe = typeof cafes.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
