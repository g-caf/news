# RSS Aggregator Backend - Development Guide

## Quick Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Testing
- `npm test` - Run tests (when implemented)
- `npm run build` - Verify build passes

### Database
- `npm run migrate` - Apply database migrations
- `npm run seed` - Add sample data (includes demo users and RSS feeds)

## Project Structure

```
src/
├── config/          # Database and app configuration
├── middleware/      # Express middleware (auth, validation, etc.)
├── models/          # Database models
├── routes/          # API route handlers
├── services/        # Business logic (RSS parsing, scheduling)
├── utils/           # Utility functions (logging, etc.)
├── migrations/      # Database migration files
└── seeds/           # Database seed data
```

## Key Features

### RSS Feed Management
- Automated parsing every 30 minutes (configurable)
- Article deduplication by URL + publication
- Full-text search with PostgreSQL
- Error handling and retry logic

### User System
- JWT authentication
- Read/unread article tracking per user
- Saved articles functionality
- User activity tracking

### API Endpoints
All endpoints are under `/api/` prefix:
- `/articles` - Article listing with filters
- `/publications` - RSS feed management
- `/auth` - User authentication
- `/search` - Article search
- `/admin` - System administration

### Database
- PostgreSQL with full-text search indexes
- Automatic timestamp updates
- Foreign key constraints
- Optimized queries with proper indexing

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set up PostgreSQL database
3. Configure `DATABASE_URL` and `JWT_SECRET`
4. Run migrations: `npm run migrate`
5. Optionally seed data: `npm run seed`

## Deployment Notes

### Render Deployment
- Build command: `npm install && npm run migrate`
- Start command: `npm start`
- Add PostgreSQL service and use internal URL
- Set all environment variables in Render dashboard

### Environment Variables (Production)
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret for JWT tokens
- `RSS_UPDATE_INTERVAL` - Feed update interval in minutes
- `PORT` - Server port (automatically set by Render)

## Code Conventions

### Models
- Use static methods for database operations
- Handle errors gracefully
- Return consistent data structures
- Use prepared statements for security

### Routes
- Validate all inputs with Joi schemas
- Use middleware for authentication
- Return consistent JSON responses
- Log errors with context

### Services
- Keep business logic separate from routes
- Use async/await for database operations
- Implement proper error handling
- Log important operations

## Common Tasks

### Adding New RSS Feed
```javascript
const publication = await Publication.create({
  name: 'Feed Name',
  rss_url: 'https://example.com/feed.xml',
  website_url: 'https://example.com',
  description: 'Description',
  category: 'Technology'
});
```

### Manual Feed Refresh
- Via API: `POST /api/publications/:id/refresh`
- Via admin: `POST /api/admin/scheduler/trigger`

### Database Queries
- Use the `query` function from `src/config/database.js`
- Always use parameterized queries
- Handle connection errors gracefully

## Monitoring

### Logs
- Application logs in `logs/` directory
- Error logs separate from info logs
- JSON format for structured logging

### Health Checks
- `/health` - Basic server health
- `/api/admin/health` - Database connectivity
- `/api/admin/stats` - System statistics

## Sample Data

After running `npm run seed`:
- Admin user: admin@example.com / admin123
- Demo user: demo@example.com / demo123
- 5 sample RSS feeds (TechCrunch, Hacker News, BBC, etc.)

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation with Joi
- SQL injection prevention
- Security headers with Helmet
- CORS configuration

## Performance Optimizations

- Database indexes on frequently queried columns
- Connection pooling for PostgreSQL
- Compression middleware
- Efficient bulk operations for articles
- Pagination for large result sets
- Full-text search indexes
