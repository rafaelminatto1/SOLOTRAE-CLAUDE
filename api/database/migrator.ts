/**
 * Database migration system
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { database } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Migration manager class
 */
export class Migrator {
  constructor() {
    // No need to store database instance
  }

  /**
   * Initialize migrations table
   */
  private async initializeMigrationsTable(): Promise<void> {
    await database.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const rows = await database.all('SELECT filename FROM migrations ORDER BY filename');
    return rows.map(row => row.filename);
  }

  /**
   * Get list of available migration files
   */
  private getAvailableMigrations(): string[] {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('Migrations directory does not exist');
      return [];
    }

    return fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  /**
   * Execute a single migration file
   */
  private async executeMigration(filename: string): Promise<void> {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split SQL file into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing migration: ${filename}`);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await database.run(statement);
      }
    }

    // Record migration as executed
    await database.run(
      'INSERT INTO migrations (filename) VALUES (?)',
      [filename]
    );

    console.log(`Migration ${filename} executed successfully`);
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('Starting database migrations...');

      // Initialize migrations table
      await this.initializeMigrationsTable();

      // Get executed and available migrations
      const executedMigrations = await this.getExecutedMigrations();
      const availableMigrations = this.getAvailableMigrations();

      // Find pending migrations
      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.includes(migration)
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations found');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migrations`);

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log('All migrations executed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string, content: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
    const filePath = path.join(MIGRATIONS_DIR, filename);

    // Ensure migrations directory exists
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    // Write migration file
    const migrationContent = `-- Migration: ${filename}
-- Description: ${name}
-- Created: ${new Date().toISOString().split('T')[0]}

${content}`;

    fs.writeFileSync(filePath, migrationContent, 'utf8');
    console.log(`Migration file created: ${filename}`);

    return filename;
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    executed: string[];
    pending: string[];
    total: number;
  }> {
    await this.initializeMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const availableMigrations = this.getAvailableMigrations();
    const pendingMigrations = availableMigrations.filter(
      migration => !executedMigrations.includes(migration)
    );

    return {
      executed: executedMigrations,
      pending: pendingMigrations,
      total: availableMigrations.length
    };
  }
}

/**
 * Run migrations using the database instance
 */
export async function runMigrations(): Promise<void> {
  const migrator = new Migrator();
  await migrator.runMigrations();
}