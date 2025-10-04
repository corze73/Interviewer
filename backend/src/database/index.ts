import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl, validateEnv } from '../utils/env';
import { logger } from '../utils/logger';
import * as schema from './schema';

// Database connection
let db: ReturnType<typeof drizzle> | null = null;
let sql: ReturnType<typeof postgres> | null = null;

export async function connectDatabase() {
  const env = validateEnv();
  const databaseUrl = getDatabaseUrl();

  try {
    // Create postgres connection
    sql = postgres(databaseUrl, {
      max: env.NODE_ENV === 'production' ? 20 : 5,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: env.NODE_ENV === 'production' ? 'require' : false,
    });

    // Create drizzle instance
    db = drizzle(sql, { schema });

    // Test connection
    await sql`SELECT 1`;
    
    logger.info('Database connected successfully', {
      url: databaseUrl.replace(/:[^:]*@/, ':***@'), // Hide password in logs
    });

    return db;
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (sql) {
    await sql.end();
    sql = null;
    db = null;
    logger.info('Database connection closed');
  }
}

// Health check for database
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!sql) return false;
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
}

// Export schema for use in other modules
export { schema };