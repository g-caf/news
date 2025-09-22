const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');

const Article = require('../models/Article');
const Publication = require('../models/Publication');

// Home page - latest articles
router.get('/', async (req, res, next) => {
  try {
    console.log('Home page route hit');
    const limit = 20;
    const offset = parseInt(req.query.offset) || 0;
    const publicationId = req.query.publication || null;
    
    console.log('Fetching articles...');
    // Get articles (without user context for now)
    const articles = await Article.findAll({
      limit,
      offset,
      publicationId,
      userId: null
    });
    console.log(`Found ${articles.length} articles`);
    
    console.log('Fetching publications...');
    // Get publications for filter
    const publications = await Publication.getAll();
    console.log(`Found ${publications.length} publications`);
    
    console.log('Rendering home template...');
    res.render('home', {
      title: 'Latest Stories',
      articles,
      publications,
      selectedPublication: publicationId,
      offset
    });
  } catch (error) {
    console.error('Home page error:', error);
    next(error);
  }
});

// Publications page
router.get('/publications', async (req, res, next) => {
  try {
    const publications = await Publication.getAllWithStats();
    
    res.render('publications', {
      title: 'Publications',
      publications
    });
  } catch (error) {
    next(error);
  }
});

// Article detail page
router.get('/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id, null);
    
    if (!article) {
      return res.status(404).render('errors/404', { title: 'Article Not Found' });
    }
    
    // Sanitize HTML content if it exists
    let sanitizedContent = '';
    if (article.content && article.content.trim()) {
      sanitizedContent = sanitizeHtml(article.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
        allowedAttributes: {
          a: ['href', 'name', 'target', 'rel'],
          img: ['src', 'alt', 'title', 'loading', 'decoding'],
          '*': ['class']
        }
      });
    }
    
    res.render('article', {
      title: article.title,
      article,
      sanitizedContent
    });
  } catch (error) {
    next(error);
  }
});

// Search page
router.get('/search', async (req, res, next) => {
  try {
    const searchQuery = req.query.q || '';
    const limit = 50;
    
    let articles = [];
    if (searchQuery.trim()) {
      articles = await Article.findAll({ 
        search: searchQuery, 
        limit,
        userId: null 
      });
    }
    
    res.render('search', {
      title: searchQuery ? `Search: ${searchQuery}` : 'Search',
      articles,
      query: searchQuery
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
