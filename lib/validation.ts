import { z } from "zod";
import { RATING_MAX, RATING_MIN } from "@/lib/ratings";

/** El Salvador bounding box — keeps pins on the map (and honest). */
const SV_BOUNDS = {
  lat: { min: 13.0, max: 14.5 },
  lng: { min: -90.2, max: -87.6 },
} as const;

const score = z.coerce
  .number()
  .int()
  .min(RATING_MIN, `Score must be at least ${RATING_MIN}`)
  .max(RATING_MAX, `Score must be at most ${RATING_MAX}`);

/** Shared shape for the per-dimension scores — keys mirror lib/ratings.ts. */
export const reviewInput = z.object({
  cafeId: z.string().min(1),
  author: z.string().trim().min(1, "Tell us your name").max(60),
  comment: z.string().trim().max(600).optional().default(""),
  // Anonymous identity fallback — a hex SHA-256 computed client-side.
  fingerprint: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional()
    .catch(undefined),
  wifi: score,
  coffee: score,
  outlets: score,
  meetings: score,
});

export type ReviewInput = z.infer<typeof reviewInput>;

export const cafeInput = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  area: z.string().trim().min(2, "Where is it? e.g. San Benito, San Salvador").max(80),
  address: z.string().trim().max(160).optional().default(""),
  lat: z.coerce
    .number()
    .min(SV_BOUNDS.lat.min, "Latitude outside El Salvador")
    .max(SV_BOUNDS.lat.max, "Latitude outside El Salvador"),
  lng: z.coerce
    .number()
    .min(SV_BOUNDS.lng.min, "Longitude outside El Salvador")
    .max(SV_BOUNDS.lng.max, "Longitude outside El Salvador"),
  wifiName: z.string().trim().max(60).optional().default(""),
  wifiPassword: z.string().trim().max(60).optional().default(""),
});

export type CafeInput = z.infer<typeof cafeInput>;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
