const express = require('express');
const Publication = require('../models/Publication');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const rssParserService = require('../services/rssParser');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/publications - Get all publications
router.get('/', async (req, res) => {
  try {
    const isActive = req.query.active !== 'false';
    const publications = await Publication.findAll(isActive);
    res.json(publications);
  } catch (error) {
    logger.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/publications/:id - Get specific publication
router.get('/:id', async (req, res) => {
  try {
    const publicationId = parseInt(req.params.id);
    
    if (isNaN(publicationId)) {
      return res.status(400).json({ error: 'Invalid publication ID' });
    }

    const publication = await Publication.findById(publicationId);
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json(publication);
  } catch (error) {
    logger.error('Error fetching publication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/publications - Create new publication
router.post('/',
  authenticate,
  validate(schemas.createPublication),
  async (req, res) => {
    try {
      // Check if RSS URL already exists
      const existingPublication = await Publication.findByUrl(req.body.rss_url);
      if (existingPublication) {
        return res.status(409).json({ 
          error: 'Publication with this RSS URL already exists',
          existing_publication: existingPublication 
        });
      }

      const publication = await Publication.create(req.body);
      
      // Trigger initial feed parsing for the new publication
      setTimeout(async () => {
        try {
          await rssParserService.parseFeed(publication);
          logger.info(`Initial parsing completed for new publication: ${publication.name}`);
        } catch (error) {
          logger.error(`Error in initial parsing for ${publication.name}:`, error);
        }
      }, 1000);

      res.status(201).json(publication);
    } catch (error) {
      logger.error('Error creating publication:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Publication with this RSS URL already exists' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/publications/:id - Update publication
router.put('/:id',
  authenticate,
  validate(schemas.updatePublication),
  async (req, res) => {
    try {
      const publicationId = parseInt(req.params.id);
      
      if (isNaN(publicationId)) {
        return res.status(400).json({ error: 'Invalid publication ID' });
      }

      // Check if publication exists
      const existingPublication = await Publication.findById(publicationId);
      if (!existingPublication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      // If RSS URL is being updated, check for conflicts
      if (req.body.rss_url && req.body.rss_url !== existingPublication.rss_url) {
        const conflictingPublication = await Publication.findByUrl(req.body.rss_url);
        if (conflictingPublication && conflictingPublication.id !== publicationId) {
          return res.status(409).json({ 
            error: 'Another publication with this RSS URL already exists' 
          });
        }
      }

      const publication = await Publication.update(publicationId, req.body);
      res.json(publication);
    } catch (error) {
      logger.error('Error updating publication:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Publication with this RSS URL already exists' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/publications/:id - Delete publication
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const publicationId = parseInt(req.params.id);
    
    if (isNaN(publicationId)) {
      return res.status(400).json({ error: 'Invalid publication ID' });
    }

    const publication = await Publication.delete(publicationId);
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json({ 
      message: 'Publication deleted successfully',
      deleted_publication: publication 
    });
  } catch (error) {
    logger.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/publications/:id/refresh - Manually refresh publication feed
router.post('/:id/refresh', authenticate, async (req, res) => {
  try {
    const publicationId = parseInt(req.params.id);
    
    if (isNaN(publicationId)) {
      return res.status(400).json({ error: 'Invalid publication ID' });
    }

    const publication = await Publication.findById(publicationId);
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    if (!publication.is_active) {
      return res.status(400).json({ error: 'Cannot refresh inactive publication' });
    }

    const result = await rssParserService.parseFeed(publication);

    res.json({
      message: 'Feed refresh completed',
      publication: publication.name,
      ...result
    });
  } catch (error) {
    logger.error('Error refreshing publication feed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/publications/refresh-all - Manually refresh all active feeds
router.post('/refresh-all', authenticate, async (req, res) => {
  try {
    const results = await rssParserService.parseAllActiveFeeds();

    res.json({
      message: 'All active feeds refreshed',
      ...results
    });
  } catch (error) {
    logger.error('Error refreshing all feeds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
