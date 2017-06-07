# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170607065053) do

  create_table "dashboard_items", force: :cascade do |t|
    t.integer  "dashboard_id"
    t.string   "name"
    t.string   "path"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.index ["dashboard_id"], name: "index_dashboard_items_on_dashboard_id"
  end

  create_table "dashboards", force: :cascade do |t|
    t.string   "name"
    t.text     "desktop_layout"
    t.text     "mobile_layout"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.boolean  "deleted",        default: false
    t.index ["deleted"], name: "index_dashboards_on_deleted"
  end

  create_table "insights_urls", force: :cascade do |t|
    t.string   "code"
    t.string   "path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "user"
    t.index ["code"], name: "index_insights_urls_on_code", unique: true
    t.index ["path"], name: "index_insights_urls_on_path"
    t.index ["user"], name: "index_insights_urls_on_user"
  end

  create_table "saved_views", force: :cascade do |t|
    t.text     "path"
    t.string   "title"
    t.string   "created_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "views", force: :cascade do |t|
    t.string   "name"
    t.text     "path"
    t.string   "created_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
