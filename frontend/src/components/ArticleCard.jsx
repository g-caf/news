import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react'

const ArticleCard = ({ 
  article, 
  isSaved = false, 
  isRead = false, 
  onToggleSaved, 
  onMarkAsRead, 
  variant = 'default',
  showPublication = true 
}) => {
  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSaved(article.id)
  }

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(article.id)
    }
  }

  // Different card layouts for magazine style
  const getCardClass = () => {
    switch (variant) {
      case 'featured':
        return 'article-card group md:col-span-2 md:row-span-2'
      case 'large':
        return 'article-card group md:col-span-2'
      default:
        return 'article-card group'
    }
  }

  const getImageClass = () => {
    switch (variant) {
      case 'featured':
        return 'w-full h-64 md:h-80 object-cover'
      case 'large':
        return 'w-full h-48 md:h-56 object-cover'
      default:
        return 'w-full h-32 md:h-40 object-cover'
    }
  }

  return (
    <Link
      to={`/article/${article.id}`}
      className={getCardClass()}
      onClick={handleClick}
    >
      {/* Article Image */}
      {article.image && (
        <div className="relative overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className={`${getImageClass()} group-hover:scale-105 transition-transform duration-300`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Article Content */}
      <div className={`p-4 ${variant === 'featured' ? 'md:p-6' : 'md:p-5'}`}>
        {/* Publication Badge */}
        {showPublication && article.publication && (
          <div className="flex items-center justify-between mb-3">
            <Link
              to={`/publication/${article.publication.id}`}
              className="publication-badge hover:bg-accent-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {article.publication.logo && (
                <img
                  src={article.publication.logo}
                  alt={article.publication.title}
                  className="w-4 h-4 rounded-full mr-1.5"
                />
              )}
              {article.publication.title}
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(article.published_date), { addSuffix: true })}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className={`font-display font-semibold text-gray-900 mb-3 line-clamp-3 group-hover:text-accent-700 transition-colors
          ${variant === 'featured' ? 'text-xl md:text-2xl leading-tight' : 
            variant === 'large' ? 'text-lg md:text-xl' : 'text-base md:text-lg'}`}>
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className={`text-gray-600 mb-4 line-clamp-3
          ${variant === 'featured' ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
          {article.description || article.excerpt}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {isRead && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Read
              </span>
            )}
            {article.reading_time && (
              <span>{article.reading_time} min read</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-accent-600" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-400 hover:text-accent-600" />
              )}
            </button>
            
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 text-gray-400 hover:text-accent-600" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ArticleCard
