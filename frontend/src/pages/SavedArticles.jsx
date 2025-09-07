import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'

const SavedArticles = ({ savedArticles, readArticles, onToggleSaved, onMarkAsRead }) => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedArticles()
  }, [savedArticles])

  const fetchSavedArticles = async () => {
    if (savedArticles.size === 0) {
      setLoading(false)
      setArticles([])
      return
    }

    try {
      setLoading(true)
      // Get all articles and filter by saved IDs
      const allArticles = await api.getArticles({ limit: 100 })
      const savedArticlesList = allArticles.filter(article => 
        savedArticles.has(article.id)
      )
      setArticles(savedArticlesList)
    } catch (error) {
      console.error('Failed to load saved articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Bookmark className="w-8 h-8 text-accent-600" />
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Saved Articles
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Articles you've saved for later reading
        </p>
      </div>

      {/* Saved Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">
            No saved articles yet
          </h2>
          <p className="text-gray-500 mb-6">
            Start saving articles by clicking the bookmark icon on any article
          </p>
          <a href="/" className="btn-primary">
            Browse Articles
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {articles.length} saved article{articles.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isSaved={savedArticles.has(article.id)}
                isRead={readArticles.has(article.id)}
                onToggleSaved={onToggleSaved}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedArticles
