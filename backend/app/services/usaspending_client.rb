class UsaspendingClient
  BASE_URL = 'https://api.usaspending.gov/api/v2'

  def initialize
    @conn = Faraday.new(url: BASE_URL) do |f|
      f.request :json
      f.response :json
      f.request :retry, max: 3, interval: 0.5, backoff_factor: 2
      f.adapter Faraday.default_adapter
    end
  end

  def search_awards(params = {})
    body = {
      filters: params[:filters] || default_filters,
      fields: award_fields,
      page: params[:page] || 1,
      limit: params[:limit] || 100,
      sort: 'Start Date',
      order: 'desc'
    }

    response = @conn.post('search/spending_by_award/', body)

    if response.success?
      response.body
    else
      raise "USAspending API error: #{response.status} - #{response.body}"
    end
  end

  private

  def default_filters
    {
      time_period: [
        {
          start_date: 1.year.ago.to_date.to_s,
          end_date: Date.today.to_s
        }
      ],
      award_type_codes: %w[A B C D]
    }
  end

  def award_fields
    [
      'Award ID',
      'Recipient Name',
      'Start Date',
      'Award Amount',
      'Awarding Agency',
      'Awarding Sub Agency',
      'Contract Award Type',
      'recipient_id',
      'Place of Performance State Code',
      'Description'
    ]
  end
end