const cron = require('node-cron');
const winston = require('winston');
const { parseAllFeeds } = require('../services/rssService');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/worker.log' })
  ]
});

// Parse RSS feeds function
async function parseRSSFeeds() {
  try {
    logger.info('Starting RSS feed parsing...');
    const result = await parseAllFeeds();
    logger.info('RSS feed parsing completed', { 
      feedsProcessed: result.feedsProcessed,
      articlesAdded: result.articlesAdded 
    });
  } catch (error) {
    logger.error('Error parsing RSS feeds:', error);
  }
}

// Schedule RSS parsing based on environment variable
const updateInterval = process.env.RSS_UPDATE_INTERVAL || 30;
const cronExpression = `*/${updateInterval} * * * *`; // Every N minutes

logger.info(`Starting RSS worker with interval: ${updateInterval} minutes`);

// Run immediately on startup
parseRSSFeeds();

// Schedule recurring parsing
cron.schedule(cronExpression, parseRSSFeeds, {
  scheduled: true,
  timezone: "UTC"
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Keep the worker alive
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

logger.info('RSS worker started successfully');
