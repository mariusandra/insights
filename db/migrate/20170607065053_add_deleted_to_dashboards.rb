class AddDeletedToDashboards < ActiveRecord::Migration[5.0]
  def change
    add_column :dashboards, :deleted, :boolean, default: false
    add_index :dashboards, :deleted
  end
end
