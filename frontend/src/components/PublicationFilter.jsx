import { Filter, X } from 'lucide-react'

const PublicationFilter = ({ publications, selectedPublication, onSelectPublication }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">Filter by publication:</span>
        </div>
        
        {selectedPublication && (
          <button
            onClick={() => onSelectPublication(null)}
            className="flex items-center space-x-1 text-sm text-accent-600 hover:text-accent-700"
          >
            <X className="w-4 h-4" />
            <span>Clear filter</span>
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectPublication(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedPublication
              ? 'bg-accent-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        {publications.map(publication => (
          <button
            key={publication.id}
            onClick={() => onSelectPublication(publication.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedPublication === publication.id
                ? 'bg-accent-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {publication.logo && (
              <img
                src={publication.logo}
                alt={publication.title}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span>{publication.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PublicationFilter
