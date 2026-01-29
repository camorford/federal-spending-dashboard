module Api
  module V1
    class AgenciesController < ApplicationController
      def index
        @agencies = Agency.order(:name)

        if params[:with_stats]
          @agencies = @agencies.left_joins(:awards)
                               .select('agencies.*, COUNT(awards.id) as awards_count, COALESCE(SUM(awards.amount), 0) as total_spending')
                               .group('agencies.id')
                               .order('total_spending DESC')
        end

        render json: @agencies
      end

      def show
        @agency = Agency.find(params[:id])

        stats = {
          total_spending: @agency.awards.sum(:amount),
          award_count: @agency.awards.count,
          top_recipients: top_recipients_for_agency(@agency),
          spending_by_type: spending_by_type_for_agency(@agency),
          spending_over_time: spending_over_time_for_agency(@agency)
        }

        render json: {
          agency: @agency,
          stats: stats
        }
      end

      private

      def top_recipients_for_agency(agency)
        agency.awards
              .joins(:recipient)
              .select('recipients.id, recipients.name, SUM(awards.amount) as total')
              .group('recipients.id, recipients.name')
              .order('total DESC')
              .limit(10)
              .map { |r| { id: r.id, name: r.name, total: r.total } }
      end

      def spending_by_type_for_agency(agency)
        agency.awards
              .group(:award_type)
              .sum(:amount)
      end

      def spending_over_time_for_agency(agency)
        date_trunc = Arel.sql("DATE_TRUNC('month', awarded_on)")
        
        agency.awards
              .group(date_trunc)
              .order(date_trunc)
              .sum(:amount)
              .transform_keys { |k| k.strftime('%Y-%m') }
      end
    end
  end
end