"use server";

import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { cafes, reviews } from "@/db/schema";
import { resolveDeviceId } from "@/lib/device";
import { cafeInput, reviewInput, slugify } from "@/lib/validation";

/** Discriminated result consumed by useActionState in the forms. */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; updated?: boolean }
  | {
      status: "error";
      message: string;
      fieldErrors: Record<string, string[] | undefined>;
    };

export async function createReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reviewInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { cafeId, author, comment, fingerprint, wifi, coffee, outlets, meetings } =
    parsed.data;

  const [cafe] = await db
    .select({ slug: cafes.slug })
    .from(cafes)
    .where(eq(cafes.id, cafeId))
    .limit(1);
  if (!cafe) {
    return { status: "error", message: "Café not found.", fieldErrors: {} };
  }

  const deviceId = await resolveDeviceId(fingerprint);
  const scores = { wifi, coffee, outlets, meetings };

  // One review per device per café — resubmitting edits your review.
  const [updated] = await db
    .insert(reviews)
    .values({
      id: nanoid(12),
      cafeId,
      deviceId,
      author,
      comment: comment || null,
      ...scores,
    })
    .onConflictDoUpdate({
      target: [reviews.cafeId, reviews.deviceId],
      targetWhere: sql`${reviews.deviceId} is not null`,
      set: { author, comment: comment || null, ...scores },
    })
    .returning({ createdAt: reviews.createdAt, id: reviews.id });

  revalidatePath(`/cafes/${cafe.slug}`);
  revalidatePath("/");
  // If the row's createdAt predates this call, the insert became an update.
  const wasUpdate =
    updated != null && Date.now() - updated.createdAt.getTime() > 5_000;
  return { status: "success", updated: wasUpdate };
}

export async function createCafe(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = cafeInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { name, area, address, lat, lng, wifiName, wifiPassword } = parsed.data;

  let slug = slugify(name);
  const [taken] = await db
    .select({ id: cafes.id })
    .from(cafes)
    .where(eq(cafes.slug, slug))
    .limit(1);
  if (taken) slug = `${slug}-${nanoid(4).toLowerCase()}`;

  await db.insert(cafes).values({
    id: nanoid(12),
    slug,
    name,
    area,
    address: address || null,
    lat,
    lng,
    wifiName: wifiName || null,
    wifiPassword: wifiPassword || null,
  });

  revalidatePath("/");
  redirect(`/cafes/${slug}`);
}
