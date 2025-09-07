import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'

const SearchPage = ({ savedArticles, readArticles, onToggleSaved, onMarkAsRead }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
      performSearch(urlQuery)
    }
  }, [searchParams])

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      const results = await api.searchArticles(searchQuery.trim())
      setArticles(results)
    } catch (error) {
      console.error('Search failed:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      performSearch(query.trim())
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">
          Search Articles
        </h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, topics, publications..."
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {loading ? (
        <LoadingSpinner />
      ) : hasSearched ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              {articles.length > 0 
                ? `Found ${articles.length} article${articles.length !== 1 ? 's' : ''} for "${searchParams.get('q')}"`
                : `No articles found for "${searchParams.get('q')}"`
              }
            </h2>
          </div>

          {articles.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No articles found</p>
              <p className="text-gray-400">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Search for articles</p>
          <p className="text-gray-400">Enter keywords to find articles across all publications</p>
        </div>
      )}
    </div>
  )
}

export default SearchPage
