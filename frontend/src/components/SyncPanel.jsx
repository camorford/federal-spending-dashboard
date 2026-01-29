import { useState, useEffect } from 'react'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import api from '../services/api'

function SyncPanel() {
  const [status, setStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [awardType, setAwardType] = useState('contracts')
  const [pages, setPages] = useState(5)

  async function fetchStatus() {
    try {
      const data = await api.getSyncStatus()
      setStatus(data)
      setSyncing(data.is_running)
    } catch (err) {
      console.error('Failed to fetch sync status:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleSync() {
    try {
      setError(null)
      setSyncing(true)
      await api.startSync(awardType, pages)
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        const data = await api.getSyncStatus()
        setStatus(data)
        if (!data.is_running) {
          setSyncing(false)
          clearInterval(pollInterval)
        }
      }, 2000)
    } catch (err) {
      setError(err.message)
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Sync</h2>
      
      {status?.last_sync && (
        <div className="mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>
              Last sync: {new Date(status.last_sync.completed_at).toLocaleString()}
            </span>
          </div>
          <div className="ml-6">
            {status.last_sync.records_processed} records imported
          </div>
        </div>
      )}

      {syncing && status?.current_sync && (
        <div className="mb-4 text-sm text-blue-600">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Syncing... {status.current_sync.records_processed || 0} records</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Award Type
          </label>
          <select
            value={awardType}
            onChange={(e) => setAwardType(e.target.value)}
            disabled={syncing}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="contracts">Contracts</option>
            <option value="grants">Grants</option>
            <option value="loans">Loans</option>
            <option value="direct_payments">Direct Payments</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pages to Import (100 records each)
          </label>
          <select
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            disabled={syncing}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value={1}>1 page (100 records)</option>
            <option value={5}>5 pages (500 records)</option>
            <option value={10}>10 pages (1,000 records)</option>
            <option value={20}>20 pages (2,000 records)</option>
          </select>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Latest Data'}
        </button>
      </div>
    </div>
  )
}

export default SyncPanel
