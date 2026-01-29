class SyncLog < ApplicationRecord
  SYNC_TYPES = %w[full incremental].freeze
  STATUSES = %w[pending running completed failed].freeze

  validates :sync_type, presence: true, inclusion: { in: SYNC_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :recent, -> { order(created_at: :desc) }
  scope :completed, -> { where(status: 'completed') }
  scope :failed, -> { where(status: 'failed') }
  scope :running, -> { where(status: 'running') }

  def self.last_successful_sync
    completed.recent.first
  end

  def self.currently_running?
    running.exists?
  end

  def start!
    update!(status: 'running', started_at: Time.current)
  end

  def complete!(records_count)
    update!(
      status: 'completed',
      completed_at: Time.current,
      records_processed: records_count
    )
  end

  def fail!(error)
    update!(
      status: 'failed',
      completed_at: Time.current,
      error_message: error.to_s
    )
  end
end
