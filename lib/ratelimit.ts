import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { env } from "@/env";

/**
 * Upstash sliding-window rate limits for the write paths (server actions).
 * Keys are prefixed `svcafe` so a shared Redis stays isolated. When the
 * Upstash env vars are absent (e.g. fresh clone), limiting degrades to a
 * no-op instead of breaking writes.
 */
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function makeLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>, action: string) {
  return redis
    ? new Ratelimit({
        redis,
        limiter,
        prefix: `svcafe:${action}`,
        analytics: true,
      })
    : null;
}

const limiters = {
  // A device shouldn't legitimately post/edit reviews faster than this.
  review: makeLimiter(Ratelimit.slidingWindow(5, "1 m"), "review"),
  // New cafés are rarer still.
  cafe: makeLimiter(Ratelimit.slidingWindow(3, "10 m"), "cafe"),
};

export type RateLimitKind = keyof typeof limiters;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/** Best-effort caller IP (behind a proxy/CDN) — fallback identifier. */
export async function callerIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function checkRateLimit(
  kind: RateLimitKind,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = limiters[kind];
  if (!limiter) return { ok: true };

  const { success, reset } = await limiter.limit(identifier);
  if (success) return { ok: true };
  return {
    ok: false,
    retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}
