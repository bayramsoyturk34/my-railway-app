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

console.log('Original DATABASE_URL:', databaseUrl);

// Fix common Railway DATABASE_URL formatting issues
// 1. Fix http:: or https:: double colon issues
if (databaseUrl.includes('::')) {
  databaseUrl = databaseUrl.replace(/^[^:]+::/, 'postgresql://');
  console.log('Fixed double colon issue. New URL:', databaseUrl);
}

// 2. Fix http:// or https:// protocol issues
if (databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
  databaseUrl = databaseUrl.replace(/^https?:\/\//, 'postgresql://');
  console.log('Fixed protocol from http(s) to postgresql. New URL:', databaseUrl);
}

// 3. Ensure postgresql:// protocol
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  // Extract everything after first ://
  const urlParts = databaseUrl.split('://');
  if (urlParts.length > 1) {
    databaseUrl = 'postgresql://' + urlParts[urlParts.length - 1];
    console.log('Added postgresql protocol. New URL:', databaseUrl);
  }
}

// Validate URL format
try {
  const url = new URL(databaseUrl);
  console.log(`✅ Database connection validated: ${url.protocol}//${url.hostname}:${url.port}${url.pathname}`);
} catch (error) {
  console.error('❌ Invalid DATABASE_URL format after fixes:', databaseUrl);
  console.error('Original DATABASE_URL was:', process.env.DATABASE_URL);
  throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
