class CreateSyncLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :sync_logs do |t|
      t.string :sync_type, null: false
      t.string :status, null: false, default: 'pending'
      t.datetime :started_at
      t.datetime :completed_at
      t.integer :records_processed, default: 0
      t.text :error_message
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :sync_logs, :status
    add_index :sync_logs, :sync_type
    add_index :sync_logs, :created_at
  end
end
