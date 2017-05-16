# == Schema Information
#
# Table name: insights_urls
#
#  code       :string
#  created_at :datetime         not null
#  id         :integer          not null, primary key
#  path       :string
#  updated_at :datetime         not null
#  user_id    :integer
#
# Indexes
#
#  index_insights_urls_on_code  (code) UNIQUE
#  index_insights_urls_on_path  (path)
#

class InsightsUrl < ApplicationRecord
end
