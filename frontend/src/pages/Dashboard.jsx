import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { DollarSign, FileText, Building2, Users } from 'lucide-react'
import api from '../services/api'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function formatCurrency(value) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [spendingOverTime, setSpendingOverTime] = useState([])
  const [spendingByAgency, setSpendingByAgency] = useState([])
  const [spendingByType, setSpendingByType] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [overviewData, timeData, agencyData, typeData] = await Promise.all([
          api.getOverview(),
          api.getSpendingOverTime('month'),
          api.getSpendingByAgency(8),
          api.getSpendingByType()
        ])

        setOverview(overviewData)
        setSpendingOverTime(timeData)
        setSpendingByAgency(agencyData)
        setSpendingByType(typeData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of federal spending data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Spending"
          value={formatCurrency(parseFloat(overview?.total_spending) || 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Total Awards"
          value={(overview?.total_awards || 0).toLocaleString()}
          icon={FileText}
        />
        <StatCard
          title="Agencies"
          value={overview?.total_agencies || 0}
          icon={Building2}
        />
        <StatCard
          title="Recipients"
          value={(overview?.total_recipients || 0).toLocaleString()}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Spending Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                nameKey="award_type"
                label={({ award_type, percent }) =>
                  `${award_type} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {spendingByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Agencies</h2>
          <Link to="/agencies" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spendingByAgency} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="code"
              tick={{ fontSize: 12 }}
              width={50}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Dashboard
