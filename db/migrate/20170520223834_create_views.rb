class CreateViews < ActiveRecord::Migration[5.0]
  def change
    create_table :views do |t|
      t.string :name
      t.text :path
      t.string :created_by
      t.timestamps

      t.timestamps
    end
  end
end
