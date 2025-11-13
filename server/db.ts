import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Railway Postgres connection
export const pool = new Pool({
  connectionString: databaseUrl,
  // Railway iç ağı için genelde SSL gerekmiyor; dış host veya error olursa aşağıyı açabiliriz:
  // ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
