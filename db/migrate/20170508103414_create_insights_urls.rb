class CreateInsightsUrls < ActiveRecord::Migration[5.0]
  def change
    create_table :insights_urls do |t|
      t.string :code
      t.string :path
      t.integer :user_id
      t.timestamps
    end
    add_index :insights_urls, :code, unique: true
    add_index :insights_urls, :path
  end
end
