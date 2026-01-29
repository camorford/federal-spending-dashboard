module Api
  module V1
    class StatsController < ApplicationController
      def overview
        render json: {
          total_spending: Award.sum(:amount),
          total_awards: Award.count,
          total_agencies: Agency.count,
          total_recipients: Recipient.count,
          last_sync: SyncLog.last_successful_sync&.completed_at,
          top_agencies: top_agencies,
          recent_large_awards: recent_large_awards
        }
      end

      def spending_over_time
        period = params[:period] || 'month'

        date_trunc = Arel.sql("DATE_TRUNC('#{period}', awarded_on)")

        results = Award.group(date_trunc)
                      .order(date_trunc)
                      .pluck(date_trunc, Arel.sql('SUM(amount)'), Arel.sql('COUNT(*)'))

        render json: results.map { |r|
          {
            period: r[0].strftime(period_format(period)),
            total: r[1],
            count: r[2]
          }
        }
      end

      def by_agency
        limit = params[:limit]&.to_i || 10

        data = Award.joins(:agency)
                    .select('agencies.id, agencies.name, agencies.code, SUM(awards.amount) as total, COUNT(awards.id) as count')
                    .group('agencies.id, agencies.name, agencies.code')
                    .order('total DESC')
                    .limit(limit)

        render json: data.map { |d|
          { id: d.id, name: d.name, code: d.code, total: d.total, count: d.count }
        }
      end

      def by_state
        data = Award.where.not(place_of_performance_state: [nil, ''])
                    .group(:place_of_performance_state)
                    .select('place_of_performance_state as state, SUM(amount) as total, COUNT(*) as count')
                    .order('total DESC')

        render json: data.map { |d|
          { state: d.state, total: d.total, count: d.count }
        }
      end

      def by_type
        data = Award.group(:award_type)
                    .select('award_type, SUM(amount) as total, COUNT(*) as count')
                    .order('total DESC')

        render json: data.map { |d|
          { award_type: d.award_type, total: d.total, count: d.count }
        }
      end

      private

      def top_agencies
        Award.joins(:agency)
             .select('agencies.id, agencies.name, SUM(awards.amount) as total')
             .group('agencies.id, agencies.name')
             .order('total DESC')
             .limit(5)
             .map { |a| { id: a.id, name: a.name, total: a.total } }
      end

      def recent_large_awards
        Award.includes(:agency, :recipient)
             .where('amount >= ?', 1_000_000)
             .order(awarded_on: :desc)
             .limit(5)
             .as_json(include: { agency: { only: [:id, :name] },
                                 recipient: { only: [:id, :name] } })
      end

      def period_format(period)
        case period
        when 'day' then '%Y-%m-%d'
        when 'week' then '%Y-%W'
        when 'year' then '%Y'
        else '%Y-%m'
        end
      end
    end
  end
end