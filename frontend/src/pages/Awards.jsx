import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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

function Awards() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [awards, setAwards] = useState([])
  const [agencies, setAgencies] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filters = {
    agency_id: searchParams.get('agency_id') || '',
    award_type: searchParams.get('award_type') || '',
    state: searchParams.get('state') || '',
    page: searchParams.get('page') || 1
  }

  useEffect(() => {
    async function fetchAgencies() {
      const data = await api.getAgencies()
      setAgencies(data)
    }
    fetchAgencies()
  }, [])

  useEffect(() => {
    async function fetchAwards() {
      try {
        setLoading(true)
        const data = await api.getAwards(filters)
        setAwards(data.awards)
        setMeta(data.meta)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAwards()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Awards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse all federal spending awards
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency
            </label>
            <select
              value={filters.agency_id}
              onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award Type
            </label>
            <select
              value={filters.award_type}
              onChange={(e) => handleFilterChange('award_type', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="contract">Contract</option>
              <option value="grant">Grant</option>
              <option value="loan">Loan</option>
              <option value="direct_payment">Direct Payment</option>
              <option value="other">Other</option>
            </select>
          </div>

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
                {awards.map((award) => (
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

export default Awards
