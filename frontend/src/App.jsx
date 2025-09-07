import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import PublicationPage from './pages/PublicationPage'
import ArticlePage from './pages/ArticlePage'
import SearchPage from './pages/SearchPage'
import SavedArticles from './pages/SavedArticles'

function App() {
  const [savedArticles, setSavedArticles] = useState(new Set())
  const [readArticles, setReadArticles] = useState(new Set())

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedArticles')
    const read = localStorage.getItem('readArticles')
    
    if (saved) {
      setSavedArticles(new Set(JSON.parse(saved)))
    }
    if (read) {
      setReadArticles(new Set(JSON.parse(read)))
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('savedArticles', JSON.stringify([...savedArticles]))
  }, [savedArticles])

  useEffect(() => {
    localStorage.setItem('readArticles', JSON.stringify([...readArticles]))
  }, [readArticles])

  const toggleSaved = (articleId) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  const markAsRead = (articleId) => {
    setReadArticles(prev => new Set([...prev, articleId]))
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="pt-16">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  savedArticles={savedArticles}
                  readArticles={readArticles}
                  onToggleSaved={toggleSaved}
                  onMarkAsRead={markAsRead}
                />
              } 
            />
            <Route 
              path="/publication/:id" 
              element={
                <PublicationPage 
                  savedArticles={savedArticles}
                  readArticles={readArticles}
                  onToggleSaved={toggleSaved}
                  onMarkAsRead={markAsRead}
                />
              } 
            />
            <Route 
              path="/article/:id" 
              element={
                <ArticlePage 
                  savedArticles={savedArticles}
                  readArticles={readArticles}
                  onToggleSaved={toggleSaved}
                  onMarkAsRead={markAsRead}
                />
              } 
            />
            <Route 
              path="/search" 
              element={
                <SearchPage 
                  savedArticles={savedArticles}
                  readArticles={readArticles}
                  onToggleSaved={toggleSaved}
                  onMarkAsRead={markAsRead}
                />
              } 
            />
            <Route 
              path="/saved" 
              element={
                <SavedArticles 
                  savedArticles={savedArticles}
                  readArticles={readArticles}
                  onToggleSaved={toggleSaved}
                  onMarkAsRead={markAsRead}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
