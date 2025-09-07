const express = require('express');
const Article = require('../models/Article');
const UserArticle = require('../models/UserArticle');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/articles - Get articles with filtering and pagination
router.get('/', 
  optionalAuth,
  validate(schemas.articlesQuery, 'query'),
  async (req, res) => {
    try {
      const {
        page,
        limit,
        publication_id,
        is_read,
        is_saved,
        start_date,
        end_date,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const userId = req.user?.id;

      const options = {
        limit,
        offset,
        publicationId: publication_id,
        userId,
        isRead: is_read,
        isSaved: is_saved,
        search,
        startDate: start_date,
        endDate: end_date
      };

      const [articles, totalCount] = await Promise.all([
        Article.findAll(options),
        Article.getCount(options)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        articles,
        pagination: {
          page,
          limit,
          total_count: totalCount,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      });
    } catch (error) {
      logger.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/articles/:id - Get specific article
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const article = await Article.findById(articleId, req.user?.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    logger.error('Error fetching article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/articles/:id/read - Mark article as read/unread
router.post('/:id/read',
  authenticate,
  validate(schemas.markReadRequest),
  async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ error: 'Invalid article ID' });
      }

      // Verify article exists
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const { is_read } = req.body;
      const userArticle = await UserArticle.markAsRead(req.user.id, articleId, is_read);

      res.json({
        message: `Article marked as ${is_read ? 'read' : 'unread'}`,
        user_article: userArticle
      });
    } catch (error) {
      logger.error('Error updating article read status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/articles/:id/save - Save/unsave article
router.post('/:id/save',
  authenticate,
  validate(schemas.markSavedRequest),
  async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ error: 'Invalid article ID' });
      }

      // Verify article exists
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const { is_saved } = req.body;
      const userArticle = await UserArticle.markAsSaved(req.user.id, articleId, is_saved);

      res.json({
        message: `Article ${is_saved ? 'saved' : 'unsaved'}`,
        user_article: userArticle
      });
    } catch (error) {
      logger.error('Error updating article saved status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/articles/bulk/read - Mark multiple articles as read
router.post('/bulk/read',
  authenticate,
  validate(schemas.bulkMarkReadRequest),
  async (req, res) => {
    try {
      const { article_ids } = req.body;
      
      const userArticles = await UserArticle.markMultipleAsRead(req.user.id, article_ids);

      res.json({
        message: `${article_ids.length} articles marked as read`,
        updated_count: userArticles.length
      });
    } catch (error) {
      logger.error('Error bulk updating article read status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/search - Search articles
router.get('/search',
  optionalAuth,
  validate(schemas.searchQuery, 'query'),
  async (req, res) => {
    try {
      const { q: search, page, limit } = req.query;
      const offset = (page - 1) * limit;
      const userId = req.user?.id;

      const options = {
        limit,
        offset,
        userId,
        search
      };

      const [articles, totalCount] = await Promise.all([
        Article.findAll(options),
        Article.getCount(options)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        articles,
        search_query: search,
        pagination: {
          page,
          limit,
          total_count: totalCount,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      });
    } catch (error) {
      logger.error('Error searching articles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
