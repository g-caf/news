require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const logger = require('./utils/logger');
const schedulerService = require('./services/scheduler');

// Import routes
const articlesRouter = require('./routes/articles');
const publicationsRouter = require('./routes/publications');
const authRouter = require('./routes/auth');
const searchRouter = require('./routes/search');
const adminRouter = require('./routes/admin');
const pagesRouter = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 10000;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure EJS template engine
app.set('trust proxy', 1);
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
if (process.env.NODE_ENV === 'production') {
  app.set('view cache', true);
}

// Security middleware - relax CSP for our inline styles/scripts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"]
    }
  }
}));

// CORS only in development - production serves from same origin
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
}

// Health check endpoints (BEFORE rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API health check for Render
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rate limiting (AFTER health checks)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Static assets
const publicPath = path.join(__dirname, '..', 'public');
console.log('Serving static files from:', publicPath);
console.log('Public directory exists:', fs.existsSync(publicPath));
if (fs.existsSync(publicPath)) {
  console.log('Public directory contents:', fs.readdirSync(publicPath));
  const cssPath = path.join(publicPath, 'css');
  const jsPath = path.join(publicPath, 'js');
  console.log('CSS directory exists:', fs.existsSync(cssPath));
  console.log('JS directory exists:', fs.existsSync(jsPath));
  if (fs.existsSync(cssPath)) {
    console.log('CSS files:', fs.readdirSync(cssPath));
  }
  if (fs.existsSync(jsPath)) {
    console.log('JS files:', fs.readdirSync(jsPath));
  }
}

// Serve static files with explicit paths
app.use('/assets', express.static(publicPath));
app.use(express.static(publicPath));

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug logging for all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health checks moved above before rate limiting

// Page routes (serve HTML)
app.use('/', pagesRouter);

// API routes (serve JSON)
app.use('/api/articles', articlesRouter);
app.use('/api/publications', publicationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/admin', adminRouter);

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 404 handler for pages
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  return res.status(404).render('errors/404', { title: 'Page Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  // Return JSON for API routes, HTML for page routes
  if (req.path.startsWith('/api') || req.accepts('json')) {
    return res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }
  
  return res.status(statusCode).render('errors/500', { 
    title: 'Server Error',
    error: message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  // Stop the scheduler
  schedulerService.stop();
  
  // Close the server
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, () => {
  logger.info(`RSS Aggregator server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start the scheduler
  try {
    schedulerService.start();
  } catch (error) {
    logger.error('Failed to start scheduler:', error);
  }
});

// Handle process signals for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
