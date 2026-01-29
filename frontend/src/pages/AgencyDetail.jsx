import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronUp, ChevronDown } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function formatCurrency(value) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function SortHeader({ label, field, currentSort, currentDirection, onSort, align = 'left' }) {
  const isActive = currentSort === field
  
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <span className="flex flex-col">
          <ChevronUp className={`w-3 h-3 -mb-1 ${isActive && currentDirection === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
          <ChevronDown className={`w-3 h-3 ${isActive && currentDirection === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
        </span>
      </div>
    </th>
  )
}

function AgencyDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ field: 'total', direction: 'desc' })

  useEffect(() => {
    async function fetchAgency() {
      try {
        setLoading(true)
        const result = await api.getAgency(id)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAgency()
  }, [id])

  function handleSort(field) {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  function sortedRecipients(recipients) {
    if (!recipients) return []
    
    return [...recipients].sort((a, b) => {
      let aVal, bVal
      
      switch (sort.field) {
        case 'name':
          aVal = a.name || ''
          bVal = b.name || ''
          break
        case 'total':
          aVal = parseFloat(a.total) || 0
          bVal = parseFloat(b.total) || 0
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
  if (!data) return <div>Agency not found</div>

  const { agency, stats } = data

  const spendingByTypeData = Object.entries(stats.spending_by_type || {}).map(([type, amount]) => ({
    type,
    amount: parseFloat(amount)
  }))

  const spendingOverTimeData = Object.entries(stats.spending_over_time || {}).map(([period, amount]) => ({
    period,
    amount: parseFloat(amount)
  }))

  return (
    <div className="space-y-8">
      <div>
        <Link to="/agencies" className="text-sm text-blue-600 hover:underline">
          ← Back to Agencies
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {agency.code}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
        </div>
        {agency.description && (
          <p className="mt-2 text-gray-600">{agency.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Spending</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(parseFloat(stats.total_spending) || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Awards</p>
          <p className="text-3xl font-bold text-gray-900">
            {(stats.award_count || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {spendingByTypeData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Type</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={spendingByTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {spendingOverTimeData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={spendingOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {stats.top_recipients?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Recipients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader
                    label="Recipient"
                    field="name"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Total Received"
                    field="total"
                    currentSort={sort.field}
                    currentDirection={sort.direction}
                    onSort={handleSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedRecipients(stats.top_recipients).map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/recipients/${recipient.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {recipient.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(parseFloat(recipient.total))}
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

export default AgencyDetail