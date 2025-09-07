require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { query } = require('../config/database');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const executedMigrations = await query('SELECT filename FROM migrations');
    const executedFiles = new Set(executedMigrations.rows.map(row => row.filename));

    // Get list of migration files
    const migrationDir = __dirname;
    const files = await fs.readdir(migrationDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

    // Run pending migrations
    for (const file of sqlFiles) {
      if (!executedFiles.has(file)) {
        logger.info(`Running migration: ${file}`);
        const filePath = path.join(migrationDir, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        await query(sql);
        await query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
        
        logger.info(`Migration completed: ${file}`);
      } else {
        logger.info(`Migration already executed: ${file}`);
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runMigrations;
