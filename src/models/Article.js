const { query } = require('../config/database');

class Article {
  static async findAll(options = {}) {
    const {
      limit = 20,
      offset = 0,
      publicationId,
      userId,
      isRead,
      isSaved,
      search,
      startDate,
      endDate
    } = options;

    let sql = `
      SELECT a.*, p.name as publication_name, p.logo_url as publication_logo,
             ua.is_read, ua.is_saved, ua.read_at, ua.saved_at
      FROM articles a
      JOIN publications p ON a.publication_id = p.id
      LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $1
      WHERE 1=1
    `;

    const params = [userId];
    let paramCount = 2;

    if (publicationId) {
      sql += ` AND a.publication_id = $${paramCount}`;
      params.push(publicationId);
      paramCount++;
    }

    if (isRead !== undefined) {
      sql += ` AND COALESCE(ua.is_read, false) = $${paramCount}`;
      params.push(isRead);
      paramCount++;
    }

    if (isSaved !== undefined) {
      sql += ` AND COALESCE(ua.is_saved, false) = $${paramCount}`;
      params.push(isSaved);
      paramCount++;
    }

    if (search) {
      sql += ` AND to_tsvector('english', a.title || ' ' || COALESCE(a.summary, '') || ' ' || COALESCE(a.content, '')) @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
      paramCount++;
    }

    if (startDate) {
      sql += ` AND a.published_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      sql += ` AND a.published_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    sql += ` ORDER BY a.published_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id, userId = null) {
    let sql = `
      SELECT a.*, p.name as publication_name, p.logo_url as publication_logo,
             p.website_url as publication_website
    `;

    if (userId) {
      sql += `, ua.is_read, ua.is_saved, ua.read_at, ua.saved_at`;
    }

    sql += `
      FROM articles a
      JOIN publications p ON a.publication_id = p.id
    `;

    if (userId) {
      sql += ` LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $2`;
    }

    sql += ` WHERE a.id = $1`;

    const params = userId ? [id, userId] : [id];
    const result = await query(sql, params);
    return result.rows[0];
  }

  static async create(data) {
    const {
      title,
      content,
      summary,
      url,
      guid,
      author,
      published_date,
      publication_id,
      image_url,
      word_count,
      reading_time
    } = data;

    const sql = `
      INSERT INTO articles (
        title, content, summary, url, guid, author, published_date,
        publication_id, image_url, word_count, reading_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (url, publication_id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        summary = EXCLUDED.summary,
        author = EXCLUDED.author,
        published_date = EXCLUDED.published_date,
        image_url = EXCLUDED.image_url,
        word_count = EXCLUDED.word_count,
        reading_time = EXCLUDED.reading_time
      RETURNING *
    `;

    const result = await query(sql, [
      title, content, summary, url, guid, author, published_date,
      publication_id, image_url, word_count, reading_time
    ]);
    
    return result.rows[0];
  }

  static async bulkCreate(articles) {
    if (articles.length === 0) return [];

    const values = [];
    const placeholders = [];

    articles.forEach((article, index) => {
      const baseIndex = index * 11;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11})`
      );
      
      values.push(
        article.title,
        article.content,
        article.summary,
        article.url,
        article.guid,
        article.author,
        article.published_date,
        article.publication_id,
        article.image_url,
        article.word_count,
        article.reading_time
      );
    });

    const sql = `
      INSERT INTO articles (
        title, content, summary, url, guid, author, published_date,
        publication_id, image_url, word_count, reading_time
      )
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (url, publication_id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        summary = EXCLUDED.summary,
        author = EXCLUDED.author,
        published_date = EXCLUDED.published_date,
        image_url = EXCLUDED.image_url,
        word_count = EXCLUDED.word_count,
        reading_time = EXCLUDED.reading_time
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows;
  }

  static async getCount(options = {}) {
    const { publicationId, userId, isRead, isSaved, search } = options;

    let sql = `
      SELECT COUNT(*) as count
      FROM articles a
      LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $1
      WHERE 1=1
    `;

    const params = [userId];
    let paramCount = 2;

    if (publicationId) {
      sql += ` AND a.publication_id = $${paramCount}`;
      params.push(publicationId);
      paramCount++;
    }

    if (isRead !== undefined) {
      sql += ` AND COALESCE(ua.is_read, false) = $${paramCount}`;
      params.push(isRead);
      paramCount++;
    }

    if (isSaved !== undefined) {
      sql += ` AND COALESCE(ua.is_saved, false) = $${paramCount}`;
      params.push(isSaved);
      paramCount++;
    }

    if (search) {
      sql += ` AND to_tsvector('english', a.title || ' ' || COALESCE(a.summary, '') || ' ' || COALESCE(a.content, '')) @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
      paramCount++;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Article;
