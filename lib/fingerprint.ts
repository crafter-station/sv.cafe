"use client";

/**
 * Lightweight, permission-free device fingerprint: stable browser traits
 * hashed with SHA-256. Deliberately coarse — it's a fallback for recovering
 * an anonymous identity when the cookie is gone, not a tracking tool.
 */
export async function computeFingerprint(): Promise<string> {
  const traits = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(navigator.hardwareConcurrency ?? 0),
    String(new Date().getTimezoneOffset()),
  ].join("|");

  const bytes = new TextEncoder().encode(traits);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
