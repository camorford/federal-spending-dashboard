module Api
  module V1
    class RecipientsController < ApplicationController
      def index
        @recipients = Recipient.order(:name)

        @recipients = @recipients.by_state(params[:state]) if params[:state].present?
        @recipients = @recipients.by_type(params[:type]) if params[:type].present?

        if params[:with_stats]
          @recipients = @recipients.left_joins(:awards)
                                   .select('recipients.*, COUNT(awards.id) as awards_count, COALESCE(SUM(awards.amount), 0) as total_received')
                                   .group('recipients.id')
                                   .order('total_received DESC')
        end

        @pagy, @recipients = pagy(@recipients, limit: params[:per_page] || 25)

        render json: {
          recipients: @recipients,
          meta: pagination_meta(@pagy)
        }
      end

      def show
        @recipient = Recipient.find(params[:id])

        @pagy, @awards = pagy(
          @recipient.awards.includes(:agency).recent,
          limit: params[:per_page] || 10
        )

        stats = {
          total_received: @recipient.awards.sum(:amount),
          award_count: @recipient.awards.count,
          agencies: agencies_for_recipient(@recipient),
          spending_by_type: @recipient.awards.group(:award_type).sum(:amount)
        }

        render json: {
          recipient: @recipient,
          stats: stats,
          recent_awards: @awards.as_json(include: { agency: { only: [:id, :name] } }),
          meta: pagination_meta(@pagy)
        }
      end

      private

      def agencies_for_recipient(recipient)
        recipient.awards
                 .joins(:agency)
                 .select('agencies.id, agencies.name, SUM(awards.amount) as total')
                 .group('agencies.id, agencies.name')
                 .order('total DESC')
                 .map { |a| { id: a.id, name: a.name, total: a.total } }
      end
    end
  end
end