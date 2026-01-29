class CreateRecipients < ActiveRecord::Migration[8.1]
  def change
    create_table :recipients do |t|
      t.string :name, null: false
      t.string :recipient_type
      t.string :city
      t.string :state
      t.string :country, default: 'USA'

      t.timestamps
    end

    add_index :recipients, :name
    add_index :recipients, :state
    add_index :recipients, :recipient_type
  end
end
