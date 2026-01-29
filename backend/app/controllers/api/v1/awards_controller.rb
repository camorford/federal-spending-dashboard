module Api
  module V1
    class AwardsController < ApplicationController
      def index
        awards = Award.includes(:agency, :recipient).recent

        awards = awards.by_agency(params[:agency_id]) if params[:agency_id].present?
        awards = awards.by_type(params[:award_type]) if params[:award_type].present?
        awards = awards.by_state(params[:state]) if params[:state].present?

        if params[:start_date].present? && params[:end_date].present?
          awards = awards.by_date_range(params[:start_date], params[:end_date])
        end

        if params[:min_amount].present?
          awards = awards.where('amount >= ?', params[:min_amount])
        end

        if params[:max_amount].present?
          awards = awards.where('amount <= ?', params[:max_amount])
        end

        @pagy, @awards = pagy(awards, limit: params[:per_page] || 25)

        render json: {
          awards: @awards.as_json(include: { agency: { only: [:id, :name, :code] },
                                             recipient: { only: [:id, :name, :state] } }),
          meta: pagination_meta(@pagy)
        }
      end

      def show
        @award = Award.includes(:agency, :recipient).find(params[:id])
        render json: @award.as_json(include: [:agency, :recipient])
      end
    end
  end
end
