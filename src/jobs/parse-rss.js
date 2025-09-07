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
    new winston.transports.Console()
  ]
});

// One-time RSS parsing job for cron
async function runRSSParsingJob() {
  try {
    logger.info('Starting one-time RSS feed parsing job...');
    const startTime = Date.now();
    
    const result = await parseAllFeeds();
    
    const duration = Date.now() - startTime;
    logger.info('RSS feed parsing job completed', { 
      feedsProcessed: result.feedsProcessed,
      articlesAdded: result.articlesAdded,
      duration: `${duration}ms`
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('Error in RSS parsing job:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down job');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down job');
  process.exit(0);
});

// Run the job
runRSSParsingJob();
