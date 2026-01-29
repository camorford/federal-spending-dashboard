module Api
  module V1
    class SyncController < ApplicationController
      def status
        last_sync = SyncLog.last_successful_sync
        current_sync = SyncLog.running.first

        render json: {
          last_sync: last_sync&.as_json(only: [:id, :sync_type, :completed_at, :records_processed]),
          is_running: current_sync.present?,
          current_sync: current_sync&.as_json(only: [:id, :sync_type, :started_at, :records_processed])
        }
      end

      def start
        if SyncLog.currently_running?
          render json: { error: 'A sync is already running' }, status: :conflict
          return
        end

        award_type = params[:award_type] || 'contracts'
        pages = (params[:pages] || 5).to_i.clamp(1, 20)

        sync_log = SyncLog.create!(sync_type: 'incremental', status: 'pending')
        
        Thread.new do
          begin
            sync_log.start!
            importer = AwardImporter.new(award_type: award_type)
            importer.import(pages: pages, sync_log: sync_log)
          rescue => e
            sync_log.fail!(e.message)
          end
        end

        render json: { 
          message: 'Sync started',
          sync_id: sync_log.id,
          award_type: award_type,
          pages: pages
        }
      end
    end
  end
end
