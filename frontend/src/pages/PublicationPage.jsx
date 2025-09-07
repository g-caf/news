import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'

const PublicationPage = ({ savedArticles, readArticles, onToggleSaved, onMarkAsRead }) => {
  const { id } = useParams()
  const [publication, setPublication] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [publicationData, articlesData] = await Promise.all([
        api.getPublication(id),
        api.getArticles({ publicationId: parseInt(id), limit: 50 })
      ])
      
      if (!publicationData) {
        setError('Publication not found')
      } else {
        setPublication(publicationData)
        setArticles(articlesData)
      }
    } catch (err) {
      setError('Failed to load publication')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !publication) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Publication not found'}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all articles</span>
        </Link>
      </div>

      {/* Publication Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start space-x-6">
          {publication.logo && (
            <img
              src={publication.logo}
              alt={publication.title}
              className="w-16 h-16 rounded-full flex-shrink-0"
            />
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              {publication.title}
            </h1>
            
            {publication.description && (
              <p className="text-lg text-gray-600 mb-4">
                {publication.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4">
              {publication.website && (
                <a
                  href={publication.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-accent-600 hover:text-accent-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit website</span>
                </a>
              )}
              
              <span className="text-gray-500">
                {articles.length} article{articles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found for this publication</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Latest Articles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isSaved={savedArticles.has(article.id)}
                isRead={readArticles.has(article.id)}
                onToggleSaved={onToggleSaved}
                onMarkAsRead={onMarkAsRead}
                showPublication={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicationPage
