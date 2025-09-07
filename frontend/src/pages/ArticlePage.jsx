import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, BookmarkCheck, ExternalLink, ArrowLeft, Clock, User } from 'lucide-react'
import ReadingProgress from '../components/ReadingProgress'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'

const ArticlePage = ({ savedArticles, onToggleSaved, onMarkAsRead }) => {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchArticle()
    // Mark as read when component mounts
    onMarkAsRead(parseInt(id))
  }, [id, onMarkAsRead])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const articleData = await api.getArticle(id)
      if (!articleData) {
        setError('Article not found')
      } else {
        setArticle(articleData)
      }
    } catch (err) {
      setError('Failed to load article')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSaved = () => {
    onToggleSaved(parseInt(id))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Article not found'}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const isSaved = savedArticles.has(parseInt(id))

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />
      
      {/* Article Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          </div>

          {/* Publication Info */}
          {article.publication && (
            <Link
              to={`/publication/${article.publication.id}`}
              className="inline-flex items-center space-x-3 mb-4 group"
            >
              {article.publication.logo && (
                <img
                  src={article.publication.logo}
                  alt={article.publication.title}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <h2 className="text-sm font-medium text-gray-900 group-hover:text-accent-600">
                  {article.publication.title}
                </h2>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(article.published_date), { addSuffix: true })}
                  </span>
                  {article.reading_time && (
                    <span>{article.reading_time} min read</span>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Article Title */}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Article Description */}
          {article.description && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {article.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleSaved}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-accent-100 text-accent-800 border border-accent-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>

            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Original</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Article Image */}
      {article.image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div 
          className="prose prose-lg prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Article Footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleSaved}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-accent-100 text-accent-800 border border-accent-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save for later</span>
                </>
              )}
            </button>
          </div>

          {article.publication && (
            <Link
              to={`/publication/${article.publication.id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>More from {article.publication.title}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticlePage
