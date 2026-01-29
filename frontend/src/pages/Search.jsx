import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function Search() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await api.autocomplete(query)
        setSuggestions(data.suggestions || [])
      } catch (err) {
        setSuggestions([])
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  async function handleSearch(e) {
    e?.preventDefault()
    if (!query.trim()) return

    setShowSuggestions(false)
    try {
      setLoading(true)
      setError(null)
      const data = await api.search(query)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestionClick(suggestion) {
    setQuery(suggestion)
    setShowSuggestions(false)
    setTimeout(() => handleSearch(), 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Awards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search by recipient name, description, or agency
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search for awards..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="text-red-600">Error: {error}</div>}

      {loading && <LoadingSpinner />}

      {results && !loading && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Found {results.total_results} results for "{results.query}"
            {results.fallback && ' (using fallback search)'}
          </p>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.awards.map((award) => (
                  <tr key={award.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/recipients/${award.recipient?.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {award.recipient?.name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {award.agency?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">
                        {award.award_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(parseFloat(award.amount))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {award.awarded_on}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {results.meta.total_pages > 1 && (
            <p className="text-sm text-gray-500">
              Page {results.meta.current_page} of {results.meta.total_pages}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Search