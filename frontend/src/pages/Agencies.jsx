import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function formatCurrency(value) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${(value / 1_000).toFixed(1)}K`
}

function Agencies() {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAgencies() {
      try {
        setLoading(true)
        const data = await api.getAgencies(true)
        setAgencies(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAgencies()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agencies</h1>
        <p className="mt-1 text-sm text-gray-500">
          Federal agencies and their spending
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency) => (
          <Link
            key={agency.id}
            to={`/agencies/${agency.id}`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {agency.code}
                </span>
                <h3 className="mt-2 font-semibold text-gray-900">{agency.name}</h3>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Total Spending</p>
                <p className="font-semibold">{formatCurrency(parseFloat(agency.total_spending) || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Awards</p>
                <p className="font-semibold">{(agency.awards_count || 0).toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Agencies
