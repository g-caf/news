const Parser = require('rss-parser');
const Article = require('../models/Article');
const Publication = require('../models/Publication');
const articleTagger = require('./articleTagger');
const logger = require('../utils/logger');

class RSSParserService {
  constructor() {
    this.parser = new Parser({
      timeout: 15000,
      requestOptions: {
        headers: {
          'User-Agent': 'NewsHub RSS Aggregator/1.0 (+https://newshub-efwe.onrender.com)',
          'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5'
        }
      },
      customFields: {
        item: [
          ['media:content', 'media:content', { keepArray: true }],
          'media:thumbnail',
          'content:encoded',
          'content',
          'feedburner:origLink'
        ]
      }
    });
  }

  async parseFeed(publication) {
    try {
      logger.info(`Parsing feed for ${publication.name}: ${publication.rss_url}`);
      
      const feed = await this.parser.parseURL(publication.rss_url);
      const articles = [];

      for (const item of feed.items) {
        try {
          const article = await this.extractArticleData(item, publication.id);
          if (article) {
            articles.push(article);
          }
        } catch (itemError) {
          logger.warn(`Skipping malformed item for ${publication.name}: ${itemError.message}`);
        }
      }

      if (articles.length > 0) {
        const createdArticles = await Article.bulkCreate(articles);
        logger.info(`Successfully parsed ${createdArticles.length} articles for ${publication.name}`);
        
        await Publication.updateLastFetched(publication.id);
        return { success: true, count: createdArticles.length, articles: createdArticles };
      } else {
        await Publication.updateLastFetched(publication.id);
        return { success: true, count: 0, articles: [] };
      }

    } catch (error) {
      logger.error(`Error parsing feed ${publication.name}: ${error.message}`);
      await Publication.updateLastFetched(publication.id, error.message);
      return { success: false, error: error.message };
    }
  }

  async extractFullContent(url) {
    try {
      logger.info(`Extracting full content from: ${url}`);
      
      // Set a reasonable timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Extraction timeout')), 10000)
      );
      
      const extractionPromise = (async () => {
        const { extract } = await import('@extractus/article-extractor');
        return await extract(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsHub/1.0)'
          }
        });
      })();
      
      const article = await Promise.race([extractionPromise, timeoutPromise]);
      
      if (article && article.content && article.content.length > 100) {
        logger.info(`Successfully extracted ${article.content.length} characters from ${url}`);
        return {
          title: article.title || null,
          content: article.content || null,
          author: article.author || null,
          publishedTime: article.published || null
        };
      } else {
        logger.warn(`Extracted content too short or empty from ${url}`);
        return null;
      }
    } catch (error) {
      logger.warn(`Failed to extract full content from ${url}: ${error.message}`);
      return null;
    }
  }

  async extractArticleData(item, publicationId) {
    // Get URL from various possible fields
    const url = (item.link && typeof item.link === 'string' ? item.link : item.link?.href) ||
                item['feedburner:origLink'] ||
                (Array.isArray(item.links) ? item.links[0]?.href : undefined);
    
    if (!item.title || !url) {
      return null;
    }

    // Extract content from various fields
    let content = item.content || item['content:encoded'] || item.contentSnippet || item.summary || '';
    let summary = item.summary || item.excerpt || '';
    let author = item.creator || item.author || null;
    
    // Try to extract full article content (with robust error handling)
    try {
      const fullContent = await this.extractFullContent(url);
      if (fullContent) {
        if (fullContent.content && fullContent.content.length > content.length) {
          content = fullContent.content;
          logger.info(`Used extracted content for: ${item.title}`);
        }
        if (fullContent.author && !author) {
          author = fullContent.author;
        }
        if (!summary && fullContent.content) {
          summary = this.createSummary(fullContent.content);
        }
      }
    } catch (extractError) {
      logger.warn(`Content extraction failed for ${item.title}: ${extractError.message}`);
      // Continue with RSS content only
    }
    
    // If still no summary, create one from whatever content we have
    if (!summary && content) {
      summary = this.createSummary(content);
    }

    // Extract image URL safely
    let imageUrl = null;
    try {
      if (item.enclosure?.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
      } else if (item['media:content']) {
        const mc = item['media:content'];
        if (Array.isArray(mc)) {
          const candidate = mc.find(x => x?.$?.url || x?.url) || mc[0];
          imageUrl = candidate?.$?.url || candidate?.url || null;
        } else if (typeof mc === 'object' && mc !== null) {
          imageUrl = mc?.$?.url || mc?.url || null;
        } else if (typeof mc === 'string') {
          imageUrl = mc;
        }
      } else if (item['media:thumbnail']) {
        const mt = item['media:thumbnail'];
        if (Array.isArray(mt)) {
          imageUrl = mt[0]?.$?.url || mt[0]?.url || null;
        } else if (typeof mt === 'object' && mt !== null) {
          imageUrl = mt?.$?.url || mt?.url || null;
        }
      } else if (item.image) {
        imageUrl = typeof item.image === 'string' ? item.image : item.image?.url;
      }
    } catch (mediaError) {
      logger.warn(`Error extracting media for item: ${mediaError.message}`);
      imageUrl = null;
    }

    // Calculate reading time and word count
    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    // Auto-tag the article based on content
    let tags = [];
    try {
      tags = articleTagger.tagArticle(item.title, content, summary);
      logger.debug(`Article "${item.title}" tagged with: ${tags.join(', ')}`);
    } catch (tagError) {
      logger.warn(`Tagging failed for ${item.title}: ${tagError.message}`);
    }

    const articleData = {
      title: this.cleanText(item.title),
      content: this.cleanText(content),
      summary: this.cleanText(summary),
      url: url,
      guid: item.guid || url,
      author: author,
      published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
      publication_id: publicationId,
      image_url: imageUrl,
      word_count: wordCount,
      reading_time: readingTime
    };
    
    // Add tags if we have them (will be ignored if column doesn't exist)
    if (tags.length > 0) {
      articleData.tags = JSON.stringify(tags);
    }
    
    return articleData;
  }

  createSummary(content, maxLength = 300) {
    if (!content) return '';
    
    // Remove HTML tags
    const cleanContent = content.replace(/<[^>]*>/g, '');
    
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }

    // Find the last complete sentence within the limit
    const truncated = cleanContent.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.5) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    // If no good sentence break, just truncate and add ellipsis
    return truncated + '...';
  }

  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  countWords(text) {
    if (!text) return 0;
    
    const cleanText = this.cleanText(text);
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  }

  async parseAllActiveFeeds() {
    const publications = await Publication.getActiveFeeds();
    const results = [];

    logger.info(`Starting to parse ${publications.length} active feeds`);

    for (const publication of publications) {
      const result = await this.parseFeed(publication);
      results.push({
        publication: publication.name,
        ...result
      });

      // Add a small delay between requests to be respectful to RSS servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalArticles = results.reduce((sum, result) => sum + (result.count || 0), 0);
    const successfulFeeds = results.filter(result => result.success).length;

    logger.info(`Feed parsing completed: ${successfulFeeds}/${publications.length} feeds processed successfully, ${totalArticles} total articles`);

    return {
      total_feeds: publications.length,
      successful_feeds: successfulFeeds,
      total_articles: totalArticles,
      results
    };
  }
}

module.exports = new RSSParserService();
