import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronUp, ChevronDown } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function formatCurrency(value) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function SortHeader({ label, field, currentSort, currentDirection, onSort }) {
  const isActive = currentSort === field
  
  return (
    <th
      onClick={() => onSort(field)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="flex flex-col">
          <ChevronUp className={`w-3 h-3 -mb-1 ${isActive && currentDirection === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
          <ChevronDown className={`w-3 h-3 ${isActive && currentDirection === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
        </span>
      </div>
    </th>
  )
}

function Recipients() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [recipients, setRecipients] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ field: 'total_received', direction: 'desc' })

  const filters = {
    state: searchParams.get('state') || '',
    type: searchParams.get('type') || '',
    page: searchParams.get('page') || 1
  }

  useEffect(() => {
    async function fetchRecipients() {
      try {
        setLoading(true)
        const data = await api.getRecipients({ ...filters, with_stats: true })
        setRecipients(data.recipients)
        setMeta(data.meta)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipients()
  }, [searchParams])

  function handleFilterChange(key, value) {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  function handlePageChange(page) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page)
    setSearchParams(newParams)
  }

  function handleSort(field) {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  function sortedRecipients() {
    return [...recipients].sort((a, b) => {
      let aVal, bVal
      
      switch (sort.field) {
        case 'name':
          aVal = a.name || ''
          bVal = b.name || ''
          break
        case 'state':
          aVal = a.state || ''
          bVal = b.state || ''
          break
        case 'recipient_type':
          aVal = a.recipient_type || ''
          bVal = b.recipient_type || ''
          break
        case 'total_received':
          aVal = parseFloat(a.total_received) || 0
          bVal = parseFloat(b.total_received) || 0
          break
        case 'awards_count':
          aVal = a.awards_count || 0
          bVal = b.awards_count || 0
          break
        default:
          return 0
      }
      
      if (typeof aVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organizations and entities receiving federal funding
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value.toUpperCase())}
              placeholder="e.g., CA, TX, NY"
              maxLength={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="business">Business</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="government">Government</option>
              <option value="individual">Individual</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader
                    label="Name"
                    field="name"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Location"
                    field="state"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Type"
                    field="recipient_type"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Total Received"
                    field="total_received"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Awards"
                    field="awards_count"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRecipients().map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/recipients/${recipient.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {recipient.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {recipient.city && recipient.state
                        ? `${recipient.city}, ${recipient.state}`
                        : recipient.state || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {recipient.recipient_type && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">
                          {recipient.recipient_type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      {formatCurrency(parseFloat(recipient.total_received) || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">
                      {recipient.awards_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page {meta.current_page} of {meta.total_pages} ({meta.total_count} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.total_pages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Recipients