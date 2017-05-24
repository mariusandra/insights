class CreateDashboards < ActiveRecord::Migration[5.0]
  def change
    create_table :dashboards do |t|
      t.string :name
      t.text :desktop_layout
      t.text :mobile_layout
      t.timestamps
    end
  end
end
