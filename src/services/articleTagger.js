const logger = require('../utils/logger');

class ArticleTagger {
  constructor() {
    // Comprehensive keyword mapping for different topics
    this.topicKeywords = {
      'US Politics': [
        'congress', 'biden', 'trump', 'election', 'senate', 'house of representatives', 
        'supreme court', 'republican', 'democrat', 'gop', 'oval office', 'white house',
        'presidential', 'governor', 'mayor', 'congressman', 'senator', 'impeachment',
        'campaign', 'voter', 'ballot', 'midterm', 'primary', 'caucus', 'swing state',
        'electoral college', 'filibuster', 'confirmation', 'capitol hill', 'washington dc'
      ],
      
      'Global Politics': [
        'international', 'foreign policy', 'diplomacy', 'embassy', 'ambassador',
        'nato', 'united nations', 'eu', 'european union', 'brexit', 'g7', 'g20',
        'china relations', 'russia', 'ukraine', 'middle east', 'israel', 'palestine',
        'sanctions', 'trade war', 'summit', 'treaty', 'alliance', 'geopolitical',
        'foreign minister', 'prime minister', 'president', 'dictator', 'regime',
        'conflict', 'peace talks', 'ceasefire', 'humanitarian', 'refugees'
      ],
      
      'AI News': [
        'artificial intelligence', 'ai', 'machine learning', 'ml', 'chatgpt', 'gpt',
        'neural network', 'deep learning', 'algorithm', 'automation', 'robot',
        'openai', 'google ai', 'microsoft ai', 'anthropic', 'claude', 'llm',
        'large language model', 'generative ai', 'computer vision', 'nlp',
        'natural language processing', 'tensorflow', 'pytorch', 'ai model',
        'ai training', 'ai safety', 'agi', 'artificial general intelligence'
      ],
      
      'Economic News': [
        'federal reserve', 'fed', 'inflation', 'gdp', 'stock market', 'recession',
        'economy', 'economic', 'finance', 'financial', 'interest rates', 'unemployment',
        'jobs report', 'consumer price index', 'cpi', 'dow jones', 'nasdaq', 's&p 500',
        'bull market', 'bear market', 'volatile', 'treasury', 'bond', 'yield',
        'monetary policy', 'fiscal policy', 'tax', 'tariff', 'trade deficit',
        'wall street', 'earnings', 'quarterly results', 'profit', 'revenue'
      ],
      
      'Climate & Environment': [
        'climate change', 'global warming', 'carbon emissions', 'greenhouse gas',
        'renewable energy', 'solar', 'wind power', 'electric vehicle', 'ev',
        'sustainability', 'environmental', 'carbon footprint', 'net zero',
        'paris agreement', 'cop summit', 'fossil fuels', 'oil', 'natural gas',
        'deforestation', 'biodiversity', 'conservation', 'pollution', 'recycling',
        'green energy', 'carbon capture', 'sea level rise', 'extreme weather'
      ],
      
      'Technology': [
        'tech', 'technology', 'startup', 'silicon valley', 'software', 'hardware',
        'cyber', 'cybersecurity', 'data breach', 'hacking', 'privacy', 'encryption',
        'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'metaverse', 'vr',
        'virtual reality', 'augmented reality', 'ar', 'cloud computing', 'saas',
        'platform', 'app', 'mobile', 'innovation', 'digital transformation',
        'tech company', 'unicorn', 'ipo', 'venture capital', 'funding'
      ],
      
      'Health & Medicine': [
        'healthcare', 'health care', 'medical', 'medicine', 'hospital', 'doctor',
        'pandemic', 'covid', 'vaccine', 'vaccination', 'disease', 'virus',
        'treatment', 'therapy', 'clinical trial', 'fda', 'drug', 'pharmaceutical',
        'biotech', 'mental health', 'public health', 'epidemic', 'outbreak',
        'surgeon general', 'cdc', 'world health organization', 'who', 'patient',
        'diagnosis', 'symptoms', 'cure', 'prevention', 'immunity'
      ],
      
      'Business': [
        'corporate', 'corporation', 'ceo', 'chief executive', 'merger', 'acquisition',
        'ipo', 'initial public offering', 'earnings', 'quarterly', 'revenue', 'profit',
        'company', 'business', 'enterprise', 'startup', 'small business',
        'fortune 500', 'market cap', 'share price', 'dividend', 'investor',
        'board of directors', 'shareholders', 'layoffs', 'hiring', 'employment',
        'supply chain', 'manufacturing', 'retail', 'e-commerce', 'consumer'
      ]
    };
  }

  /**
   * Analyze article content and assign relevant tags
   */
  tagArticle(title, content, summary = '') {
    const tags = new Set();
    
    // Combine all text to analyze (prioritize title and summary)
    const textToAnalyze = `${title} ${title} ${summary} ${content || ''}`.toLowerCase();
    
    // Check each topic's keywords
    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      let matchScore = 0;
      let matches = [];
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const keywordMatches = textToAnalyze.match(regex);
        
        if (keywordMatches) {
          const count = keywordMatches.length;
          // Weight matches in title/summary higher
          const weight = textToAnalyze.indexOf(keyword.toLowerCase()) < (title.length + summary.length) ? 2 : 1;
          matchScore += count * weight;
          matches.push({ keyword, count, weight });
        }
      }
      
      // Add tag if we have strong matches
      // Require at least 2 points (1 strong match in title/summary, or 2+ matches in content)
      if (matchScore >= 2) {
        tags.add(topic);
        logger.debug(`Tagged article with "${topic}" (score: ${matchScore}, matches: ${matches.length})`);
      }
    }
    
    return Array.from(tags);
  }

  /**
   * Get all available topic tags
   */
  getAllTopics() {
    return Object.keys(this.topicKeywords);
  }

  /**
   * Get keywords for a specific topic
   */
  getTopicKeywords(topic) {
    return this.topicKeywords[topic] || [];
  }
}

module.exports = new ArticleTagger();
