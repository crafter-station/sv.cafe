import { nanoid } from "nanoid";
import { cookies } from "next/headers";

/**
 * Anonymous device identity, cookie-first with a fingerprint fallback.
 *
 * - The httpOnly cookie is the stable identity (survives fingerprint drift).
 * - If the cookie is missing but the client sent a fingerprint hash, we mint
 *   a deterministic `fp_…` id from it — so a wiped cookie jar recovers the
 *   same identity on the same device.
 * - No cookie and no fingerprint → fresh random id.
 */
export const DEVICE_COOKIE = "svcafe_device";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Read-only: the current device id, or null if this device has none yet. */
export async function getDeviceId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(DEVICE_COOKIE)?.value ?? null;
}

/**
 * Resolve (and persist) the device id. Only callable where cookies may be
 * written — server actions / route handlers.
 */
export async function resolveDeviceId(
  fingerprint: string | undefined,
): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const id = fingerprint ? `fp_${fingerprint.slice(0, 32)}` : `dev_${nanoid(16)}`;
  jar.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}
