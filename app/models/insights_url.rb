# == Schema Information
#
# Table name: insights_urls
#
#  code       :string
#  created_at :datetime         not null
#  id         :integer          not null, primary key
#  path       :string
#  updated_at :datetime         not null
#  user       :string
#
# Indexes
#
#  index_insights_urls_on_code  (code) UNIQUE
#  index_insights_urls_on_path  (path)
#  index_insights_urls_on_user  (user)
#

class InsightsUrl < ApplicationRecord
end
