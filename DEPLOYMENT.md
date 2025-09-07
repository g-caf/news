# Deployment Guide for RSS Aggregator on Render

This guide walks you through deploying the RSS Aggregator application on Render with PostgreSQL database, background workers, and proper security configuration.

## Prerequisites

1. [Render account](https://render.com)
2. GitHub repository with your code
3. This repository connected to your Render account

## Deployment Steps

### 1. Database Setup

The PostgreSQL database is automatically created via the `render.yaml` configuration:
- Database name: `rss_aggregator`
- User: `rss_user`
- Connection pooling enabled
- Automatic backups included

### 2. Services Configuration

The deployment includes four services:

#### Backend API Service (`rss-aggregator-backend`)
- **Type**: Web Service
- **Runtime**: Node.js
- **Plan**: Starter
- **Health Check**: `/api/health`
- **Auto-deploy**: Enabled from main branch

#### RSS Parser Worker (`rss-parser-worker`)
- **Type**: Background Worker
- **Runtime**: Node.js
- **Function**: Continuous RSS feed parsing
- **Schedule**: Every 30 minutes (configurable)

#### RSS Cron Job (`rss-cron-job`)
- **Type**: Cron Job
- **Schedule**: `*/30 * * * *` (every 30 minutes)
- **Function**: Alternative to worker for RSS parsing

#### Frontend (Optional - if separate React app)
- **Type**: Static Site
- **Build Command**: `npm run build`
- **Publish Directory**: `./build`

### 3. Environment Variables

These are automatically configured via `render.yaml`:

**Database**
- `DATABASE_URL`: Auto-generated from PostgreSQL service
- `NODE_ENV`: production

**Security**
- `JWT_SECRET`: Auto-generated secure value
- `BCRYPT_ROUNDS`: 12

**RSS Configuration**
- `RSS_UPDATE_INTERVAL`: 30 (minutes)
- `MAX_ARTICLES_PER_FEED`: 100

**Rate Limiting**
- `RATE_LIMIT_WINDOW_MS`: 900000 (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: 100

**Logging**
- `LOG_LEVEL`: info

### 4. Manual Deployment Steps

1. **Fork/Clone this repository** to your GitHub account

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository with the `render.yaml` file

3. **Review Configuration**:
   - Render will automatically detect the `render.yaml` file
   - Review the services that will be created
   - Ensure all environment variables are properly configured

4. **Deploy**:
   - Click "Apply" to start the deployment
   - Services will be created in the following order:
     1. PostgreSQL Database
     2. Backend API Service
     3. Background Worker
     4. Cron Job
     5. Frontend (if applicable)

5. **Verify Deployment**:
   - Check the health endpoint: `https://your-backend-url.onrender.com/api/health`
   - Monitor logs in the Render dashboard
   - Verify RSS parsing is working in the worker logs

### 5. Custom Domain (Optional)

1. In Render dashboard, go to your web service
2. Navigate to "Settings" → "Custom Domains"
3. Add your domain and configure DNS records

### 6. Monitoring & Logging

**Health Checks**
- Backend: `/api/health` (comprehensive system check)
- Readiness: `/api/ready` (database connectivity)
- Liveness: `/api/alive` (basic service status)

**Logging**
- Application logs: Available in Render dashboard
- Worker logs: Separate log stream for background jobs
- Log level: Configurable via `LOG_LEVEL` environment variable

**Metrics**
- Response times and error rates in Render dashboard
- Database connection pooling metrics
- Memory and CPU usage tracking

### 7. Database Migrations

Migrations run automatically on deployment:
- `npm run migrate` executes during the start command
- Initial schema created from `src/migrations/init.sql`
- Subsequent migrations can be added to the migrations directory

### 8. Background Job Configuration

**Worker Process** (Recommended for high-frequency parsing):
```javascript
// Runs continuously with cron scheduling
// Better for frequent updates (every few minutes)
// More resource usage but immediate parsing
```

**Cron Job** (Recommended for scheduled parsing):
```javascript
// Runs on schedule then exits
// Better for less frequent updates (every 30+ minutes)
// More resource efficient
```

Choose one approach and disable the other by removing it from `render.yaml`.

### 9. Security Features

**Implemented Security Measures**:
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Rate limiting (global and API-specific)
- Input validation with Joi
- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection with parameterized queries

**Security Headers**:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer Policy: strict-origin-when-cross-origin

### 10. Scaling Considerations

**Horizontal Scaling**:
- Backend service can be scaled by increasing instance count
- Database connection pooling handles multiple service instances
- Worker and cron job should remain single instance to avoid duplicate processing

**Performance Optimization**:
- Database indexes on frequently queried columns
- Connection pooling for database efficiency
- Caching headers for static assets
- Compression middleware for API responses

### 11. Troubleshooting

**Common Issues**:

1. **Database Connection Errors**:
   - Check `DATABASE_URL` environment variable
   - Verify database service is running
   - Check connection pool settings

2. **RSS Parsing Not Working**:
   - Check worker/cron job logs
   - Verify RSS feed URLs are accessible
   - Check for parsing errors in feed_parse_logs table

3. **High Memory Usage**:
   - Monitor RSS parsing frequency
   - Adjust `MAX_ARTICLES_PER_FEED` setting
   - Consider implementing article cleanup job

4. **CORS Errors**:
   - Verify frontend URL in CORS configuration
   - Check `FRONTEND_URL` environment variable
   - Update allowed origins in `src/config/cors.js`

### 12. Development vs Production

**Development Setup**:
```bash
npm run dev          # Start with nodemon
npm run migrate      # Run migrations
npm run seed         # Seed database (optional)
```

**Production Commands**:
```bash
npm start           # Start with migrations
npm run worker      # Start background worker
npm run cron        # Run one-time RSS parsing
```

### 13. Cost Optimization

**Render Free Tier Usage**:
- Use Starter plans for low-traffic applications
- Combine worker and cron job functionality to reduce service count
- Monitor usage and upgrade plans as needed

**Resource Optimization**:
- Set appropriate RSS update intervals
- Implement article cleanup for old articles
- Use database indexes efficiently
- Monitor and optimize slow queries

## Support

For issues related to:
- **Application Code**: Check application logs and this documentation
- **Render Platform**: Refer to [Render Documentation](https://render.com/docs)
- **Database Issues**: Check PostgreSQL logs in Render dashboard

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Implement additional RSS feeds
3. Add user authentication endpoints
4. Create frontend application
5. Set up automated backups
6. Configure SSL certificates for custom domains
