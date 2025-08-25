/**
 * Database initialization
 */
import { database } from './config.js';
import { runMigrations } from './migrator.js';
import { seedDatabase } from './seed.js';

/**
 * Initialize the database
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Connect to database
    await database.connect();
    console.log('Database connected successfully');
    
    // Run migrations
    await runMigrations();
    console.log('Database migrations completed successfully');
    
    // Check if database needs seeding
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('Database is empty, seeding with initial data...');
      await seedDatabase();
      console.log('Database seeded successfully');
    } else {
      console.log('Database already contains data, skipping seed');
    }
    
    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    await database.close();
  } catch (error) {
    console.error('Error closing database:', error);
    throw error;
  }
}

// Export database instance and migrator
export { database };
export { Migrator } from './migrator.js';
export * from './config.js';
export * from './schema.js';
export * from './seed.js';