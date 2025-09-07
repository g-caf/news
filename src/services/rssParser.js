const Parser = require('rss-parser');
const Article = require('../models/Article');
const Publication = require('../models/Publication');
const logger = require('../utils/logger');

class RSSParserService {
  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      customFields: {
        item: ['media:content', 'content:encoded', 'content']
      }
    });
  }

  async parseFeed(publication) {
    try {
      logger.info(`Parsing feed for ${publication.name}: ${publication.rss_url}`);
      
      const feed = await this.parser.parseURL(publication.rss_url);
      const articles = [];

      for (const item of feed.items) {
        const article = this.extractArticleData(item, publication.id);
        if (article) {
          articles.push(article);
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

  extractArticleData(item, publicationId) {
    if (!item.title || !item.link) {
      return null;
    }

    // Extract content from various fields
    let content = item.content || item['content:encoded'] || item.contentSnippet || item.summary || '';
    let summary = item.summary || item.excerpt || '';
    
    // If no summary, create one from content
    if (!summary && content) {
      summary = this.createSummary(content);
    }

    // Extract image URL
    let imageUrl = null;
    if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
      imageUrl = item.enclosure.url;
    } else if (item['media:content']) {
      imageUrl = item['media:content'].$.url;
    } else if (item.image) {
      imageUrl = typeof item.image === 'string' ? item.image : item.image.url;
    }

    // Calculate reading time and word count
    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    return {
      title: this.cleanText(item.title),
      content: this.cleanText(content),
      summary: this.cleanText(summary),
      url: item.link,
      guid: item.guid || item.link,
      author: item.creator || item.author || null,
      published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
      publication_id: publicationId,
      image_url: imageUrl,
      word_count: wordCount,
      reading_time: readingTime
    };
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
