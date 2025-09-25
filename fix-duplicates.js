#!/usr/bin/env node

const { query } = require('./src/config/database');
const logger = require('./src/utils/logger');

async function fixDuplicatePublications() {
  try {
    logger.info('🔍 Checking for duplicate publications...');
    
    // 1. Find current duplicates by name (case insensitive)
    const duplicatesResult = await query(`
      SELECT LOWER(TRIM(name)) as normalized_name, 
             array_agg(id ORDER BY created_at ASC) as ids,
             array_agg(name ORDER BY created_at ASC) as names,
             array_agg(rss_url ORDER BY created_at ASC) as urls,
             COUNT(*) as count
      FROM publications 
      GROUP BY LOWER(TRIM(name))
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `);
    
    if (duplicatesResult.rows.length === 0) {
      logger.info('✅ No duplicate publications found');
    } else {
      logger.info(`⚠️  Found ${duplicatesResult.rows.length} duplicate publication groups`);
      
      for (const duplicate of duplicatesResult.rows) {
        const [keepId, ...deleteIds] = duplicate.ids;
        const [keepName, ...deleteNames] = duplicate.names;
        const [keepUrl, ...deleteUrls] = duplicate.urls;
        
        logger.info(`📰 "${keepName}" (${duplicate.count} duplicates):`);
        logger.info(`   ✅ Keeping: ID ${keepId} - ${keepUrl}`);
        deleteIds.forEach((id, idx) => {
          logger.info(`   ❌ Deleting: ID ${id} - ${deleteUrls[idx]}`);
        });
        
        // 2. Update articles to point to the kept publication
        for (const deleteId of deleteIds) {
          const articleUpdateResult = await query(`
            UPDATE articles 
            SET publication_id = $1 
            WHERE publication_id = $2
            ON CONFLICT (url, publication_id) DO NOTHING
          `, [keepId, deleteId]);
          
          logger.info(`   📰 Moved ${articleUpdateResult.rowCount} articles from ID ${deleteId} to ${keepId}`);
        }
        
        // 3. Delete the duplicate publications
        const deleteResult = await query(`
          DELETE FROM publications 
          WHERE id = ANY($1::int[])
        `, [deleteIds]);
        
        logger.info(`   🗑️  Deleted ${deleteResult.rowCount} duplicate publications`);
      }
    }
    
    // 4. Add unique constraint on normalized name to prevent future duplicates
    try {
      await query(`
        CREATE UNIQUE INDEX CONCURRENTLY publications_name_normalized_unique 
        ON publications (LOWER(TRIM(name)))
        WHERE is_active = true
      `);
      logger.info('✅ Added unique constraint on normalized publication name');
    } catch (constraintError) {
      if (constraintError.message.includes('already exists') || constraintError.message.includes('duplicate key')) {
        logger.info('ℹ️  Unique constraint already exists or duplicate names still present');
        
        // Show remaining duplicates
        const remainingDuplicates = await query(`
          SELECT LOWER(TRIM(name)) as normalized_name, 
                 array_agg(name) as names,
                 COUNT(*) as count
          FROM publications 
          WHERE is_active = true
          GROUP BY LOWER(TRIM(name))
          HAVING COUNT(*) > 1
        `);
        
        if (remainingDuplicates.rows.length > 0) {
          logger.warn('⚠️  Still have duplicates that need manual review:');
          remainingDuplicates.rows.forEach(dup => {
            logger.warn(`   - "${dup.normalized_name}": ${dup.names.join(', ')}`);
          });
        }
      } else {
        logger.warn('⚠️  Could not add unique constraint:', constraintError.message);
      }
    }
    
    // 5. Show final publication count
    const finalCount = await query('SELECT COUNT(*) as count FROM publications WHERE is_active = true');
    logger.info(`✅ Final count: ${finalCount.rows[0].count} active publications`);
    
    logger.info('✅ Duplicate cleanup completed successfully!');
    
  } catch (error) {
    logger.error('❌ Error during duplicate cleanup:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixDuplicatePublications()
    .then(() => {
      logger.info('✅ Duplicate fix completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Duplicate fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixDuplicatePublications;