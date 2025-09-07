import { useState, useEffect } from 'react'
import ArticleCard from '../components/ArticleCard'
import PublicationFilter from '../components/PublicationFilter'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'

const HomePage = ({ savedArticles, readArticles, onToggleSaved, onMarkAsRead }) => {
  const [articles, setArticles] = useState([])
  const [publications, setPublications] = useState([])
  const [selectedPublication, setSelectedPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [articlesData, publicationsData] = await Promise.all([
        api.getArticles({ limit: 50 }),
        api.getPublications()
      ])
      setArticles(articlesData)
      setPublications(publicationsData)
    } catch (err) {
      setError('Failed to load articles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = selectedPublication
    ? articles.filter(article => article.publication?.id === selectedPublication)
    : articles

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Create magazine layout with featured articles
  const featuredArticle = filteredArticles[0]
  const largeArticles = filteredArticles.slice(1, 3)
  const regularArticles = filteredArticles.slice(3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
          Latest Stories
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Stay informed with the latest articles from your favorite publications
        </p>
      </div>

      {/* Publication Filter */}
      <PublicationFilter
        publications={publications}
        selectedPublication={selectedPublication}
        onSelectPublication={setSelectedPublication}
      />

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Article */}
          {featuredArticle && (
            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Featured Story
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ArticleCard
                  article={featuredArticle}
                  variant="featured"
                  isSaved={savedArticles.has(featuredArticle.id)}
                  isRead={readArticles.has(featuredArticle.id)}
                  onToggleSaved={onToggleSaved}
                  onMarkAsRead={onMarkAsRead}
                />
                
                {/* Large articles alongside featured */}
                <div className="space-y-6">
                  {largeArticles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="large"
                      isSaved={savedArticles.has(article.id)}
                      isRead={readArticles.has(article.id)}
                      onToggleSaved={onToggleSaved}
                      onMarkAsRead={onMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Regular Articles Grid */}
          {regularArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                More Stories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map(article => (
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
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default HomePage
