import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
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

function RecipientDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ field: 'awarded_on', direction: 'desc' })

  useEffect(() => {
    async function fetchRecipient() {
      try {
        setLoading(true)
        const result = await api.getRecipient(id)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipient()
  }, [id])

  function handleSort(field) {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  function sortedAwards(awards) {
    if (!awards) return []
    
    return [...awards].sort((a, b) => {
      let aVal, bVal
      
      switch (sort.field) {
        case 'agency':
          aVal = a.agency?.name || ''
          bVal = b.agency?.name || ''
          break
        case 'award_type':
          aVal = a.award_type || ''
          bVal = b.award_type || ''
          break
        case 'awarded_on':
          aVal = a.awarded_on || ''
          bVal = b.awarded_on || ''
          break
        case 'amount':
          aVal = parseFloat(a.amount) || 0
          bVal = parseFloat(b.amount) || 0
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

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!data) return <div>Recipient not found</div>

  const { recipient, stats, recent_awards } = data

  return (
    <div className="space-y-8">
      <div>
        <Link to="/recipients" className="text-sm text-blue-600 hover:underline">
          ← Back to Recipients
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{recipient.name}</h1>
        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
          {recipient.city && recipient.state && (
            <span>{recipient.city}, {recipient.state}</span>
          )}
          {recipient.recipient_type && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {recipient.recipient_type}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Received</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(parseFloat(stats.total_received) || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Awards</p>
          <p className="text-3xl font-bold text-gray-900">
            {(stats.award_count || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {stats.agencies?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Funding Agencies</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Agency
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total Funding
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/agencies/${agency.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {agency.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(parseFloat(agency.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recent_awards?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Awards</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader
                    label="Agency"
                    field="agency"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Type"
                    field="award_type"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Date"
                    field="awarded_on"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Amount"
                    field="amount"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedAwards(recent_awards).map((award) => (
                  <tr key={award.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {award.agency?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {award.award_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {award.awarded_on}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(parseFloat(award.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipientDetail