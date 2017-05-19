class AddUserStringToUrls < ActiveRecord::Migration[5.0]
  def change
    add_column :insights_urls, :user, :string
    add_index :insights_urls, :user
    remove_column :insights_urls, :user_id
  end
end
