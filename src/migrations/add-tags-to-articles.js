const { query } = require('../config/database');
const logger = require('../utils/logger');

async function addTagsColumn() {
  try {
    logger.info('Adding tags column to articles table...');
    
    // Add tags column as JSON array
    await query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS tags JSON DEFAULT '[]'::json
    `);
    
    logger.info('Successfully added tags column to articles table');
  } catch (error) {
    logger.error('Error adding tags column:', error);
    throw error;
  }
}

if (require.main === module) {
  addTagsColumn()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addTagsColumn;
