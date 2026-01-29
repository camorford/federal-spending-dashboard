const API_BASE = '/api/v1'

class ApiService {
  async get(endpoint, params = {}) {
    const url = new URL(`${window.location.origin}${API_BASE}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value)
      }
    })

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return response.json()
  }

  async getOverview() {
    return this.get('/stats/overview')
  }

  async getSpendingOverTime(period = 'month') {
    return this.get('/stats/spending_over_time', { period })
  }

  async getSpendingByAgency(limit = 10) {
    return this.get('/stats/by_agency', { limit })
  }

  async getSpendingByState() {
    return this.get('/stats/by_state')
  }

  async getSpendingByType() {
    return this.get('/stats/by_type')
  }

  async getAwards(params = {}) {
    return this.get('/awards', params)
  }

  async getAward(id) {
    return this.get(`/awards/${id}`)
  }

  async getAgencies(withStats = false) {
    return this.get('/agencies', { with_stats: withStats })
  }

  async getAgency(id) {
    return this.get(`/agencies/${id}`)
  }

  async getRecipients(params = {}) {
    return this.get('/recipients', params)
  }

  async getRecipient(id) {
    return this.get(`/recipients/${id}`)
  }

  async search(query, params = {}) {
    return this.get('/search', { q: query, ...params })
  }

  async autocomplete(query) {
    return this.get('/search/autocomplete', { q: query })
  }
}

export const api = new ApiService()
export default api
