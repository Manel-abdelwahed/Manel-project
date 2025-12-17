"use client"

import { useState, useEffect } from "react"
import { clientsAPI, campaignsAPI, usersAPI } from "../services/api"
import "../styles/SearchBar.css"

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([])
      return
    }

    const performSearch = async () => {
      setLoading(true)
      try {
        const [clients, campaigns, users] = await Promise.all([
          clientsAPI.getAll(),
          campaignsAPI.getAll(),
          usersAPI.getAll(),
        ])

        const searchLower = searchTerm.toLowerCase()
        const combined = [
          ...clients.data.map((c) => ({ ...c, type: "client" })),
          ...campaigns.data.map((c) => ({ ...c, type: "campaign" })),
          ...users.data.map((u) => ({ ...u, type: "user" })),
        ].filter(
          (item) =>
            item.name?.toLowerCase().includes(searchLower) ||
            item.email?.toLowerCase().includes(searchLower) ||
            item.title?.toLowerCase().includes(searchLower),
        )

        setResults(combined.slice(0, 8))
        setIsOpen(true)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(performSearch, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const getIcon = (type) => {
    switch (type) {
      case "client":
        return "👤"
      case "campaign":
        return "📢"
      case "user":
        return "👨‍💼"
      default:
        return "🔍"
    }
  }

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher clients, campagnes, utilisateurs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Recherche en cours...</div>
          ) : results.length > 0 ? (
            <div className="results-list">
              {results.map((result, idx) => (
                <div key={idx} className="result-item">
                  <span className="result-icon">{getIcon(result.type)}</span>
                  <div className="result-info">
                    <p className="result-name">{result.name || result.title}</p>
                    <p className="result-type">{result.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-empty">Aucun résultat trouvé</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
