const cron = require('node-cron');
const rssParserService = require('./rssParser');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    const interval = process.env.RSS_UPDATE_INTERVAL || '30';
    const cronExpression = `*/${interval} * * * *`; // Every N minutes

    logger.info(`Starting RSS feed scheduler with ${interval}-minute intervals`);

    // Schedule RSS feed parsing
    const feedParsingJob = cron.schedule(cronExpression, async () => {
      logger.info('Starting scheduled RSS feed parsing');
      try {
        const results = await rssParserService.parseAllActiveFeeds();
        logger.info('Scheduled RSS feed parsing completed', results);
      } catch (error) {
        logger.error('Error in scheduled RSS feed parsing:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule cleanup job (daily at 2 AM)
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled cleanup');
      try {
        await this.cleanupOldData();
        logger.info('Scheduled cleanup completed');
      } catch (error) {
        logger.error('Error in scheduled cleanup:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set('feedParsing', feedParsingJob);
    this.jobs.set('cleanup', cleanupJob);

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`Started scheduled job: ${name}`);
    });

    this.isRunning = true;

    // Run initial feed parsing on startup
    setTimeout(async () => {
      logger.info('Running initial RSS feed parsing on startup');
      try {
        await rssParserService.parseAllActiveFeeds();
      } catch (error) {
        logger.error('Error in initial RSS feed parsing:', error);
      }
    }, 5000); // Wait 5 seconds after startup
  }

  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    logger.info('Stopping scheduler');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped scheduled job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    
    logger.info('Scheduler stopped');
  }

  async cleanupOldData() {
    const { query } = require('../config/database');
    
    try {
      // Delete articles older than 90 days that are not saved by any user
      const deleteOldArticles = `
        DELETE FROM articles
        WHERE published_date < CURRENT_DATE - INTERVAL '90 days'
          AND id NOT IN (
            SELECT DISTINCT article_id 
            FROM user_articles 
            WHERE is_saved = true
          )
      `;
      
      const result = await query(deleteOldArticles);
      logger.info(`Cleanup: Deleted ${result.rowCount} old articles`);

      // Clean up orphaned user_articles records
      const cleanupUserArticles = `
        DELETE FROM user_articles
        WHERE article_id NOT IN (SELECT id FROM articles)
      `;
      
      const userArticleResult = await query(cleanupUserArticles);
      logger.info(`Cleanup: Deleted ${userArticleResult.rowCount} orphaned user_articles records`);

    } catch (error) {
      logger.error('Error during cleanup:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.jobs.keys())
    };
  }

  async triggerFeedParsing() {
    logger.info('Manually triggering RSS feed parsing');
    try {
      const results = await rssParserService.parseAllActiveFeeds();
      logger.info('Manual RSS feed parsing completed', results);
      return results;
    } catch (error) {
      logger.error('Error in manual RSS feed parsing:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService();
