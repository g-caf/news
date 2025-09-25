const express = require('express');
const { authenticate } = require('../middleware/auth');
const schedulerService = require('../services/scheduler');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const fixDuplicates = require('../../fix-duplicates');

const router = express.Router();

// GET /api/admin/stats - Get system statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Get various system statistics
    const [
      publicationStats,
      articleStats,
      userStats,
      recentActivity
    ] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_publications,
          COUNT(*) FILTER (WHERE is_active = true) as active_publications,
          COUNT(*) FILTER (WHERE last_fetched_at > CURRENT_TIMESTAMP - INTERVAL '1 hour') as recently_updated
        FROM publications
      `),
      query(`
        SELECT 
          COUNT(*) as total_articles,
          COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours') as articles_today,
          COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as articles_this_week
        FROM articles
      `),
      query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as new_users_this_week
        FROM users
      `),
      query(`
        SELECT 
          p.name as publication_name,
          COUNT(a.id) as article_count,
          MAX(a.created_at) as latest_article
        FROM publications p
        LEFT JOIN articles a ON p.id = a.publication_id AND a.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        WHERE p.is_active = true
        GROUP BY p.id, p.name
        ORDER BY article_count DESC, p.name
        LIMIT 10
      `)
    ]);

    const schedulerStatus = schedulerService.getStatus();

    res.json({
      publications: publicationStats.rows[0],
      articles: articleStats.rows[0],
      users: userStats.rows[0],
      scheduler: schedulerStatus,
      recent_activity: recentActivity.rows
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/publications - Get detailed publication info for admin
router.get('/publications', authenticate, async (req, res) => {
  try {
    const publications = await query(`
      SELECT 
        p.*,
        COUNT(a.id) as total_articles,
        COUNT(a.id) FILTER (WHERE a.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours') as articles_today,
        COUNT(a.id) FILTER (WHERE a.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as articles_this_week,
        MAX(a.created_at) as latest_article_created
      FROM publications p
      LEFT JOIN articles a ON p.id = a.publication_id
      GROUP BY p.id
      ORDER BY p.is_active DESC, p.name
    `);

    res.json(publications.rows);
  } catch (error) {
    logger.error('Error fetching admin publication data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/scheduler/trigger - Manually trigger feed parsing
router.post('/scheduler/trigger', authenticate, async (req, res) => {
  try {
    const results = await schedulerService.triggerFeedParsing();
    res.json({
      message: 'Feed parsing triggered successfully',
      ...results
    });
  } catch (error) {
    logger.error('Error triggering feed parsing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/scheduler/status - Get scheduler status
router.get('/scheduler/status', authenticate, async (req, res) => {
  try {
    const status = schedulerService.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error fetching scheduler status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/cleanup - Run data cleanup
router.post('/cleanup', authenticate, async (req, res) => {
  try {
    await schedulerService.cleanupOldData();
    res.json({ message: 'Data cleanup completed successfully' });
  } catch (error) {
    logger.error('Error running cleanup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/fix-duplicates - TEMPORARY ENDPOINT - Remove after running
router.post('/fix-duplicates-temp', authenticate, async (req, res) => {
  try {
    await fixDuplicates();
    res.json({ 
      success: true, 
      message: 'Duplicate publication cleanup completed successfully',
      timestamp: new Date().toISOString(),
      note: 'This endpoint should be removed after running'
    });
  } catch (error) {
    logger.error('Error fixing duplicates:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/logs - Get recent log entries (simplified version)
router.get('/logs', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const level = req.query.level || 'info';

    // This is a basic implementation - in production, you might want to use a proper log aggregation service
    res.json({
      message: 'Log viewing endpoint - implement based on your logging infrastructure',
      note: 'Check the logs/combined.log file or use a log aggregation service like ELK stack',
      suggested_levels: ['error', 'warn', 'info', 'debug']
    });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await query('SELECT 1');
    
    const schedulerStatus = schedulerService.getStatus();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        scheduler: schedulerStatus.isRunning ? 'running' : 'stopped'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
