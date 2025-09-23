const { query } = require('../config/database');
const logger = require('../utils/logger');

async function cleanupDuplicatePublications() {
  try {
    logger.info('Cleaning up duplicate publications...');
    
    // Find duplicates by name
    const duplicatesResult = await query(`
      SELECT name, array_agg(id ORDER BY id) as ids, COUNT(*) as count
      FROM publications 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicatesResult.rows.length > 0) {
      logger.info(`Found ${duplicatesResult.rows.length} duplicate publication groups`);
      
      for (const duplicate of duplicatesResult.rows) {
        const [keepId, ...deleteIds] = duplicate.ids;
        logger.info(`For "${duplicate.name}": keeping ID ${keepId}, deleting IDs ${deleteIds.join(', ')}`);
        
        // Update articles to point to the kept publication
        for (const deleteId of deleteIds) {
          await query(`
            UPDATE articles 
            SET publication_id = $1 
            WHERE publication_id = $2
          `, [keepId, deleteId]);
        }
        
        // Delete the duplicate publications
        await query(`
          DELETE FROM publications 
          WHERE id = ANY($1::int[])
        `, [deleteIds]);
      }
    }
    
    // Add unique constraint on name to prevent future duplicates
    try {
      await query(`
        ALTER TABLE publications 
        ADD CONSTRAINT publications_name_unique UNIQUE (name)
      `);
      logger.info('Added unique constraint on publication name');
    } catch (constraintError) {
      if (constraintError.message.includes('already exists')) {
        logger.info('Unique constraint already exists');
      } else {
        logger.warn('Could not add unique constraint:', constraintError.message);
      }
    }
    
    logger.info('Successfully cleaned up duplicate publications');
  } catch (error) {
    logger.error('Error cleaning up duplicates:', error);
    throw error;
  }
}

if (require.main === module) {
  cleanupDuplicatePublications()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = cleanupDuplicatePublications;
