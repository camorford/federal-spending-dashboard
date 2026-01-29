module Api
  module V1
    class SearchController < ApplicationController
      def index
        query = params[:q].to_s.strip

        if query.blank?
          render json: { error: 'Query parameter "q" is required' }, status: :bad_request
          return
        end

        filters = {}
        filters[:agency_id] = params[:agency_id] if params[:agency_id].present?
        filters[:award_type] = params[:award_type] if params[:award_type].present?
        filters[:state] = params[:state] if params[:state].present?

        results = Award.pg_search(query)
        results = results.by_agency(filters[:agency_id]) if filters[:agency_id]
        results = results.by_type(filters[:award_type]) if filters[:award_type]
        results = results.by_state(filters[:state]) if filters[:state]

        @pagy, @awards = pagy(results.includes(:agency, :recipient), limit: params[:per_page] || 25)

        render json: {
          query: query,
          total_results: @pagy.count,
          awards: @awards.as_json(include: { agency: { only: [:id, :name] },
                                             recipient: { only: [:id, :name, :state] } }),
          meta: pagination_meta(@pagy)
        }
      end
    end
  end
end
