# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_29_201034) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "agencies", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_agencies_on_code", unique: true
    t.index ["name"], name: "index_agencies_on_name"
  end

  create_table "awards", force: :cascade do |t|
    t.bigint "agency_id"
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.string "award_type", null: false
    t.date "awarded_on", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.date "period_of_performance_end"
    t.date "period_of_performance_start"
    t.string "place_of_performance_state"
    t.bigint "recipient_id"
    t.datetime "updated_at", null: false
    t.string "usaspending_id"
    t.index ["agency_id", "awarded_on"], name: "index_awards_on_agency_id_and_awarded_on"
    t.index ["agency_id"], name: "index_awards_on_agency_id"
    t.index ["award_type"], name: "index_awards_on_award_type"
    t.index ["awarded_on"], name: "index_awards_on_awarded_on"
    t.index ["place_of_performance_state"], name: "index_awards_on_place_of_performance_state"
    t.index ["recipient_id", "awarded_on"], name: "index_awards_on_recipient_id_and_awarded_on"
    t.index ["recipient_id"], name: "index_awards_on_recipient_id"
    t.index ["usaspending_id"], name: "index_awards_on_usaspending_id", unique: true
  end

  create_table "recipients", force: :cascade do |t|
    t.string "city"
    t.string "country", default: "USA"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "recipient_type"
    t.string "state"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_recipients_on_name"
    t.index ["recipient_type"], name: "index_recipients_on_recipient_type"
    t.index ["state"], name: "index_recipients_on_state"
  end

  create_table "sync_logs", force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.text "error_message"
    t.jsonb "metadata", default: {}
    t.integer "records_processed", default: 0
    t.datetime "started_at"
    t.string "status", default: "pending", null: false
    t.string "sync_type", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_sync_logs_on_created_at"
    t.index ["status"], name: "index_sync_logs_on_status"
    t.index ["sync_type"], name: "index_sync_logs_on_sync_type"
  end

  add_foreign_key "awards", "agencies"
  add_foreign_key "awards", "recipients"
end
