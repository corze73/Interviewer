import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let sql: ReturnType<typeof postgres> | null = null;

export async function getDatabase() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  try {
    // Create postgres connection with SSL for Neon
    sql = postgres(databaseUrl, {
      max: 1, // Netlify functions are stateless, use minimal connections
      ssl: 'require',
    });

    // Create drizzle instance
    db = drizzle(sql, { schema });

    // Test connection
    await sql`SELECT 1`;
    
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}