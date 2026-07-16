# sv.cafe ☕

```text
       ) )
      ( (
       ) )
   .----------.
   |          |---.
   |          |   |     sv.cafe
   |          |---'     work-friendly cafés in El Salvador
    \        /
     '------'           $ rate --wifi --pass-reveal ─> on the map
   ____________
```

Community map of work-friendly cafés in El Salvador. Every café is rated on
four dimensions — **Wi-Fi**, **Coffee**, **Outlets** (easy to plug a charger)
and **Meetings** (calls & meetups friendly) — and shares its Wi-Fi network
name with a tap-to-reveal password.

## Stack

- **Next.js 16** (App Router, server actions) + Tailwind v4
- **shadcn/ui** components with a midday-inspired monochrome theme (zero radius,
  flat borders, mono-font labels, dark mode via next-themes)
- **Drizzle ORM** over **Neon** Postgres (`@neondatabase/serverless`)
- **Zod v4** validation + `@t3-oss/env-nextjs` typed env — all types derived
  from the schema (`$inferSelect`, `z.infer`), no hand-written interfaces
- **Mapbox GL** for the map

## Run it

```bash
bun install
bun run db:seed   # idempotent — seeds 8 San Salvador cafés
bun dev
```

Needs `.env.local` with `DATABASE_URL` (Neon) and `NEXT_PUBLIC_MAPBOX_TOKEN`.

## How it's wired

- `lib/ratings.ts` — single source of truth for rating dimensions; UI, forms
  and validation derive from it.
- `db/schema.ts` — `cafes` + `reviews`; `db/queries.ts` computes per-dimension
  averages in SQL.
- `app/actions.ts` — zod-validated server actions (`createReview`,
  `createCafe`) with `revalidatePath`.
- `/` — drawer-first explorer: map + list + ⌘K command palette; selecting a
  café (list, pin, or ⌘K) opens an instant drawer (bottom sheet on mobile,
  floating right sheet on desktop) — all data ships upfront, zero fetches.
- `/cafes/[slug]` — deep-link page reusing the same details component;
  `/cafes/new` — add a café (geolocation helper).
