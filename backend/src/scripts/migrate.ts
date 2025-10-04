#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { getDatabaseUrl } from '../utils/env';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

async function runMigrations() {
  const databaseUrl = getDatabaseUrl();
  
  logger.info('Starting database migrations...');
  
  try {
    // Create connection for migrations
    const migrationClient = postgres(databaseUrl, { max: 1 });
    const db = drizzle(migrationClient);
    
    // Run migrations
    await migrate(db, { migrationsFolder: './src/database/migrations' });
    
    logger.info('Database migrations completed successfully');
    
    // Close connection
    await migrationClient.end();
    
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
runMigrations();