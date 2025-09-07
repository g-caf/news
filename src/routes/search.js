const express = require('express');
const Article = require('../models/Article');
const { optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/search - Search articles
router.get('/',
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
