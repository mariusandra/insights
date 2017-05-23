class CreateDashboardItems < ActiveRecord::Migration[5.0]
  def change
    create_table :dashboard_items do |t|
      t.integer :dashboard_id
      t.string :name
      t.string :path
      t.timestamps
    end
    add_index :dashboard_items, :dashboard_id
  end
end
