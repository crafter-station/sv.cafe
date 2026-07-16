import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** Typed, validated environment. Secrets stay server-side; the browser only sees NEXT_PUBLIC_*. */
export const env = createEnv({
  server: {
    // Neon Postgres connection string (pooled).
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  },

  client: {
    // Mapbox public access token (pk.…) — account.mapbox.com → Tokens.
    NEXT_PUBLIC_MAPBOX_TOKEN: z
      .string()
      .min(1, "NEXT_PUBLIC_MAPBOX_TOKEN is required"),
    // Optional basemap override, e.g. mapbox://styles/mapbox/dark-v11
    NEXT_PUBLIC_MAP_STYLE_URL: z.string().min(1).optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
