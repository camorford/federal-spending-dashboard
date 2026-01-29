class CreateAwards < ActiveRecord::Migration[8.1]
  def change
    create_table :awards do |t|
      t.references :agency, foreign_key: true
      t.references :recipient, foreign_key: true
      t.string :award_type, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.text :description
      t.date :awarded_on, null: false
      t.date :period_of_performance_start
      t.date :period_of_performance_end
      t.string :place_of_performance_state
      t.string :usaspending_id

      t.timestamps
    end

    add_index :awards, :award_type
    add_index :awards, :awarded_on
    add_index :awards, :place_of_performance_state
    add_index :awards, :usaspending_id, unique: true
    add_index :awards, [:agency_id, :awarded_on]
    add_index :awards, [:recipient_id, :awarded_on]
  end
end
