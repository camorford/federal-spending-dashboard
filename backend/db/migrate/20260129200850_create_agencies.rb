class CreateAgencies < ActiveRecord::Migration[8.1]
  def change
    create_table :agencies do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.text :description

      t.timestamps
    end

    add_index :agencies, :code, unique: true
    add_index :agencies, :name
  end
end
