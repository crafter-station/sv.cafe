import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { nanoid } from "nanoid";
import { cafes, reviews, type NewCafe, type NewReview } from "../db/schema";
import { slugify } from "../lib/validation";

/**
 * Seed a starter set of San Salvador–area cafés so the map isn't empty.
 * Coordinates are approximate; Wi-Fi credentials are sample data — edit from
 * the app once real ones are gathered. Run: bun --env-file=.env.local scripts/seed.ts
 */
const db = drizzle(neon(process.env.DATABASE_URL as string));

type SeedCafe = Omit<NewCafe, "id" | "slug"> & {
  sampleReviews: Array<Omit<NewReview, "id" | "cafeId">>;
};

const SEED: SeedCafe[] = [
  {
    name: "Viva Espresso",
    area: "San Benito, San Salvador",
    address: "Blvd. del Hipódromo, Col. San Benito",
    lat: 13.6957,
    lng: -89.2411,
    wifiName: "VivaEspresso_Guest",
    wifiPassword: "espresso2026",
    sampleReviews: [
      {
        author: "Marcela",
        comment:
          "Barista champions — the flat white is unreal. Wi-Fi holds video calls fine.",
        wifi: 4,
        coffee: 5,
        outlets: 3,
        meetings: 4,
      },
      {
        author: "Diego",
        comment: "Great for a client meeting, gets busy after 10am.",
        wifi: 4,
        coffee: 5,
        outlets: 3,
        meetings: 5,
      },
    ],
  },
  {
    name: "4 Monkeys Coffee Roasters",
    area: "Col. Escalón, San Salvador",
    address: "Paseo General Escalón",
    lat: 13.7021,
    lng: -89.2452,
    wifiName: "4Monkeys",
    wifiPassword: "roasted456",
    sampleReviews: [
      {
        author: "Fer",
        comment: "They roast in-house. Plenty of outlets along the wall bench.",
        wifi: 5,
        coffee: 5,
        outlets: 5,
        meetings: 3,
      },
    ],
  },
  {
    name: "The Coffee Cup",
    area: "Antiguo Cuscatlán, La Libertad",
    address: "C.C. Multiplaza, local 2-15",
    lat: 13.6752,
    lng: -89.2536,
    wifiName: "CoffeeCup_Free",
    wifiPassword: "cup12345",
    sampleReviews: [
      {
        author: "Rodrigo",
        comment: "Reliable chain, AC on point. Mall noise makes calls tricky.",
        wifi: 4,
        coffee: 3,
        outlets: 4,
        meetings: 2,
      },
    ],
  },
  {
    name: "Café Fulanos",
    area: "Centro Histórico, San Salvador",
    address: "2a Calle Poniente, frente a Plaza Morazán",
    lat: 13.6989,
    lng: -89.1914,
    wifiName: "Fulanos",
    wifiPassword: "centro503",
    sampleReviews: [
      {
        author: "Alejandra",
        comment: "Beautiful restored building downtown. Espresso is solid.",
        wifi: 3,
        coffee: 4,
        outlets: 2,
        meetings: 3,
      },
    ],
  },
  {
    name: "Shaw's Café",
    area: "Col. Escalón, San Salvador",
    address: "Paseo General Escalón y 79 Av. Norte",
    lat: 13.7048,
    lng: -89.2401,
    wifiName: "Shaws_Clientes",
    wifiPassword: "chocolate1",
    sampleReviews: [
      {
        author: "Pao",
        comment: "Quiet in the mornings, good pastries. Password on the receipt.",
        wifi: 3,
        coffee: 4,
        outlets: 3,
        meetings: 4,
      },
    ],
  },
  {
    name: "Cuscatlán Coffee Lab",
    area: "Santa Tecla, La Libertad",
    address: "Paseo El Carmen",
    lat: 13.6741,
    lng: -89.2892,
    wifiName: "CoffeeLab_STecla",
    wifiPassword: "chemex503",
    sampleReviews: [
      {
        author: "Iván",
        comment: "Pour-over heaven on Paseo El Carmen. Fiber internet, seriously fast.",
        wifi: 5,
        coffee: 5,
        outlets: 4,
        meetings: 4,
      },
    ],
  },
  {
    name: "La Terraza Café",
    area: "Zona Rosa, San Salvador",
    address: "Blvd. del Hipódromo 310",
    lat: 13.6934,
    lng: -89.2387,
    wifiName: "LaTerraza",
    wifiPassword: "terraza2026",
    sampleReviews: [
      {
        author: "Karla",
        comment: "Rooftop seating, decent lattes, chill for small meetups.",
        wifi: 3,
        coffee: 3,
        outlets: 2,
        meetings: 4,
      },
    ],
  },
  {
    name: "Bendito Bean",
    area: "Col. San Francisco, San Salvador",
    address: "Av. Las Camelias 12",
    lat: 13.6893,
    lng: -89.2244,
    wifiName: "BenditoBean_5G",
    wifiPassword: "bendito503",
    sampleReviews: [
      {
        author: "Óscar",
        comment: "Small but mighty — every table has an outlet. Ask for the cold brew.",
        wifi: 4,
        coffee: 4,
        outlets: 5,
        meetings: 3,
      },
    ],
  },
];

async function main() {
  const existing = await db.select({ id: cafes.id }).from(cafes).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded — skipping. (Truncate cafes to re-seed.)");
    return;
  }

  for (const { sampleReviews, ...cafe } of SEED) {
    const cafeId = nanoid(12);
    await db.insert(cafes).values({ ...cafe, id: cafeId, slug: slugify(cafe.name) });
    if (sampleReviews.length > 0) {
      await db.insert(reviews).values(
        sampleReviews.map((r) => ({ ...r, id: nanoid(12), cafeId })),
      );
    }
    console.log(`✓ ${cafe.name}`);
  }
  console.log(`Seeded ${SEED.length} cafés.`);
}

main();
