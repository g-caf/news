require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const seedData = {
  users: [
    {
      email: 'admin@example.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User'
    },
    {
      email: 'demo@example.com',
      password: 'demo123',
      first_name: 'Demo',
      last_name: 'User'
    }
  ],
  publications: [
    // Tech publications
    {
      name: 'TechCrunch',
      rss_url: 'https://techcrunch.com/feed/',
      website_url: 'https://techcrunch.com',
      description: 'Technology news and insights',
      category: 'Technology'
    },
    {
      name: 'Hacker News',
      rss_url: 'https://hnrss.org/frontpage',
      website_url: 'https://news.ycombinator.com',
      description: 'Social news website focusing on computer science and entrepreneurship',
      category: 'Technology'
    },
    {
      name: 'The Verge',
      rss_url: 'https://www.theverge.com/rss/index.xml',
      website_url: 'https://www.theverge.com',
      description: 'Technology, science, art, and culture news',
      category: 'Technology'
    },
    {
      name: 'Ars Technica',
      rss_url: 'https://feeds.arstechnica.com/arstechnica/index',
      website_url: 'https://arstechnica.com',
      description: 'Technology news and analysis',
      category: 'Technology'
    },
    {
      name: 'Wired',
      rss_url: 'https://www.wired.com/feed/rss',
      website_url: 'https://www.wired.com',
      description: 'Science, Technology, Business, Culture',
      category: 'Technology'
    },
    // News publications
    {
      name: 'BBC News',
      rss_url: 'https://feeds.bbci.co.uk/news/rss.xml',
      website_url: 'https://www.bbc.com/news',
      description: 'BBC News provides trusted World and UK news',
      category: 'News'
    },
    {
      name: 'The New York Times',
      rss_url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
      website_url: 'https://www.nytimes.com',
      description: 'Breaking news, world news & multimedia',
      category: 'News'
    },
    {
      name: 'The Atlantic',
      rss_url: 'https://www.theatlantic.com/feed/all/',
      website_url: 'https://www.theatlantic.com',
      description: 'News, politics, culture, technology, health, and more',
      category: 'News'
    },
    {
      name: 'The New Yorker',
      rss_url: 'https://www.newyorker.com/feed/everything',
      website_url: 'https://www.newyorker.com',
      description: 'News, politics, culture, humor, and cartoons',
      category: 'Culture'
    },
    {
      name: 'New York Magazine',
      rss_url: 'http://feeds.feedburner.com/nymag/intelligencer',
      website_url: 'https://nymag.com/intelligencer',
      description: 'Intelligencer - Politics and news',
      category: 'News'
    },
    {
      name: 'The Cut',
      rss_url: 'http://feeds.feedburner.com/nymag/fashion',
      website_url: 'https://www.thecut.com',
      description: 'Fashion, beauty, and lifestyle news',
      category: 'Culture'
    }
  ]
};

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Seed users
    logger.info('Seeding users...');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    
    for (const userData of seedData.users) {
      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [userData.email]);
      
      if (existingUser.rows.length === 0) {
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        
        await query(`
          INSERT INTO users (email, password_hash, first_name, last_name)
          VALUES ($1, $2, $3, $4)
        `, [userData.email, passwordHash, userData.first_name, userData.last_name]);
        
        logger.info(`Created user: ${userData.email}`);
      } else {
        logger.info(`User already exists: ${userData.email}`);
      }
    }

    // Seed publications
    logger.info('Seeding publications...');
    
    for (const pubData of seedData.publications) {
      // Check if publication already exists
      const existingPub = await query('SELECT id FROM publications WHERE rss_url = $1', [pubData.rss_url]);
      
      if (existingPub.rows.length === 0) {
        await query(`
          INSERT INTO publications (name, rss_url, website_url, description, category)
          VALUES ($1, $2, $3, $4, $5)
        `, [pubData.name, pubData.rss_url, pubData.website_url, pubData.description, pubData.category]);
        
        logger.info(`Created publication: ${pubData.name}`);
      } else {
        logger.info(`Publication already exists: ${pubData.name}`);
      }
    }

    logger.info('Database seeding completed successfully');
    
    // Print login information
    console.log('\n=== DEMO LOGIN CREDENTIALS ===');
    console.log('Admin User:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('\nDemo User:');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');
    console.log('===============================\n');

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
