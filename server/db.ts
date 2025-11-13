import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate and fix DATABASE_URL format
let databaseUrl = process.env.DATABASE_URL;

// Fix common Railway DATABASE_URL formatting issues
if (databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
  databaseUrl = databaseUrl.replace(/^https?:\/\//, 'postgresql://');
  console.log('Fixed DATABASE_URL protocol from http(s) to postgresql');
}

// Fix double colon issue (http:: -> postgresql://)
if (databaseUrl.includes('://')) {
  databaseUrl = databaseUrl.replace(/^[^:]+::/, 'postgresql:');
  console.log('Fixed DATABASE_URL double colon issue');
}

// Validate URL format
try {
  const url = new URL(databaseUrl);
  console.log(`Database connection: ${url.protocol}//${url.hostname}:${url.port}${url.pathname}`);
} catch (error) {
  console.error('Invalid DATABASE_URL format:', databaseUrl);
  throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
