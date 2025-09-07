-- Publications table
CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rss_url VARCHAR(500) NOT NULL UNIQUE,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMP,
    fetch_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    url VARCHAR(1000) NOT NULL,
    guid VARCHAR(500),
    author VARCHAR(255),
    published_date TIMESTAMP,
    publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    word_count INTEGER,
    reading_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url, publication_id)
);

-- Users table (for read/unread tracking)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User articles tracking table
CREATE TABLE user_articles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    is_saved BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    saved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- Create indexes for better performance
CREATE INDEX idx_articles_publication_id ON articles(publication_id);
CREATE INDEX idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_guid ON articles(guid);
CREATE INDEX idx_user_articles_user_id ON user_articles(user_id);
CREATE INDEX idx_user_articles_article_id ON user_articles(article_id);
CREATE INDEX idx_user_articles_read ON user_articles(user_id, is_read);
CREATE INDEX idx_user_articles_saved ON user_articles(user_id, is_saved);
CREATE INDEX idx_publications_active ON publications(is_active);

-- Full text search index for articles
CREATE INDEX idx_articles_search ON articles USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
