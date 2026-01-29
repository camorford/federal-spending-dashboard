module Api
  module V1
    class SearchController < ApplicationController
      def index
        query = params[:q].to_s.strip

        if query.blank?
          render json: { error: 'Query parameter "q" is required' }, status: :bad_request
          return
        end

        where_filters = {}
        where_filters[:agency_id] = params[:agency_id] if params[:agency_id].present?
        where_filters[:award_type] = params[:award_type] if params[:award_type].present?
        where_filters[:place_of_performance_state] = params[:state] if params[:state].present?

        begin
          results = Award.search(
            query,
            where: where_filters,
            includes: [:agency, :recipient],
            page: params[:page] || 1,
            per_page: params[:per_page] || 25
          )

          render json: {
            query: query,
            total_results: results.total_count,
            awards: results.map { |award|
              award.as_json(include: {
                agency: { only: [:id, :name] },
                recipient: { only: [:id, :name, :state] }
              })
            },
            meta: {
              current_page: results.current_page,
              total_pages: results.total_pages,
              total_count: results.total_count,
              per_page: results.per_page
            }
          }
        rescue => e
          Rails.logger.error "Elasticsearch error: #{e.message}"
          fallback_search(query, where_filters)
        end
      end

      def autocomplete
        query = params[:q].to_s.strip
        
        if query.length < 2
          render json: { suggestions: [] }
          return
        end

        begin
          results = Award.search(
            query,
            fields: [:recipient_name, :agency_name],
            match: :word_start,
            limit: 20,
            load: false
          )

          recipient_names = results.map(&:recipient_name).compact.uniq
          agency_names = results.map(&:agency_name).compact.uniq

          # Combine and prioritize matches that start with the query
          all_suggestions = (recipient_names + agency_names).uniq
          
          suggestions = all_suggestions.select { |s| 
            s.downcase.include?(query.downcase) 
          }.first(7)

          render json: { suggestions: suggestions }
        rescue => e
          Rails.logger.error "Autocomplete error: #{e.message}"
          render json: { suggestions: [] }
        end
      end

      private

      def fallback_search(query, filters)
        results = Award.pg_search(query).includes(:agency, :recipient)
        results = results.by_agency(filters[:agency_id]) if filters[:agency_id]
        results = results.by_type(filters[:award_type]) if filters[:award_type]
        results = results.by_state(filters[:place_of_performance_state]) if filters[:place_of_performance_state]

        @pagy, @awards = pagy(results, limit: params[:per_page] || 25)

        render json: {
          query: query,
          total_results: @pagy.count,
          awards: @awards.as_json(include: {
            agency: { only: [:id, :name] },
            recipient: { only: [:id, :name, :state] }
          }),
          meta: pagination_meta(@pagy),
          fallback: true
        }
      end
    end
  end
end