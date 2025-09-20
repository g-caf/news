import axios from 'axios';

// API base URL - use environment variable or default to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const api = {
  async getArticles({ limit = 20, offset = 0, publicationId = null, search = '' } = {}) {
    try {
      const params = { limit, offset };
      if (publicationId) params.publication_id = publicationId;
      if (search) params.search = search;

      const response = await apiClient.get('/articles', { params });
      return response.data.articles || [];
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      return [];
    }
  },

  async getArticle(id) {
    try {
      const response = await apiClient.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch article:', error);
      return null;
    }
  },

  async getPublications() {
    try {
      const response = await apiClient.get('/publications');
      return response.data.publications || [];
    } catch (error) {
      console.error('Failed to fetch publications:', error);
      return [];
    }
  },

  async getPublication(id) {
    try {
      const response = await apiClient.get(`/publications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch publication:', error);
      return null;
    }
  },

  async searchArticles(query) {
    try {
      const response = await apiClient.get('/search', { 
        params: { q: query, limit: 50 } 
      });
      return response.data.articles || [];
    } catch (error) {
      console.error('Failed to search articles:', error);
      return [];
    }
  },

  // Authentication methods (for future use)
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // User article interactions
  async markAsRead(articleId) {
    try {
      await apiClient.post(`/articles/${articleId}/read`);
    } catch (error) {
      console.error('Failed to mark article as read:', error);
    }
  },

  async saveArticle(articleId) {
    try {
      await apiClient.post(`/articles/${articleId}/save`);
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  },

  async unsaveArticle(articleId) {
    try {
      await apiClient.delete(`/articles/${articleId}/save`);
    } catch (error) {
      console.error('Failed to unsave article:', error);
    }
  }
};
