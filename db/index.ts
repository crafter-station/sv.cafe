import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

/** Drizzle over Neon's HTTP driver — stateless, ideal for serverless/Next. */
export const db = drizzle(neon(env.DATABASE_URL), { schema });
