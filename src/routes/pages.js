const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');

const Article = require('../models/Article');
const Publication = require('../models/Publication');
const articleTagger = require('../services/articleTagger');

// Home page - latest articles
router.get('/', async (req, res, next) => {
  try {
    console.log('Home page route hit');
    const limit = 20;
    const offset = parseInt(req.query.offset) || 0;
    const publicationId = req.query.publication || null;
    const category = req.query.category || null;
    const tag = req.query.tag || null;
    
    console.log('Fetching articles...');
    // Get articles (without user context for now)
    const articles = await Article.findAll({
      limit,
      offset,
      publicationId,
      category,
      tag,
      userId: null
    });
    console.log(`Found ${articles.length} articles`);
    if (articles.length > 0) {
      console.log('Sample article with image URL:', {
        title: articles[0].title,
        image_url: articles[0].image_url,
        publication: articles[0].publication_name
      });
    }
    
    console.log('Fetching publications and categories...');
    // Get publications for filter
    const publications = await Publication.getAll();
    console.log(`Found ${publications.length} publications`);
    
    // Get unique categories
    const categoryResult = await require('../config/database').query(
      'SELECT DISTINCT category FROM publications WHERE is_active = true AND category IS NOT NULL ORDER BY category'
    );
    const categories = categoryResult.rows.map(row => row.category);
    
    // Get all available topic tags
    const topicTags = articleTagger.getAllTopics();
    
    console.log('Rendering home template...');
    res.render('home', {
      title: 'Latest Stories',
      articles,
      publications,
      categories,
      topicTags,
      selectedPublication: publicationId,
      selectedCategory: category,
      selectedTag: tag,
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

// Article detail page - simplified for debugging
router.get('/articles/:id', async (req, res, next) => {
  try {
    console.log('=== ARTICLE ROUTE DEBUG ===');
    console.log('Loading article ID:', req.params.id);
    
    // Test database connection first
    const testQuery = await require('../config/database').query('SELECT 1 as test');
    console.log('Database connection OK:', testQuery.rows[0]);
    
    const article = await Article.findById(req.params.id, null);
    console.log('Article query result:', !!article);
    
    if (!article) {
      console.log('Article not found:', req.params.id);
      return res.status(404).render('errors/404', { title: 'Article Not Found' });
    }
    
    console.log('Raw article data:', JSON.stringify(article, null, 2));
    
    // Just send back basic JSON for now to test
    res.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        author: article.author,
        published_date: article.published_date,
        publication_name: article.publication_name,
        url: article.url,
        content_length: article.content ? article.content.length : 0,
        summary_length: article.summary ? article.summary.length : 0
      }
    });
    
  } catch (error) {
    console.error('=== ARTICLE ROUTE ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Article route failed', 
      message: error.message,
      stack: error.stack 
    });
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
