# == Schema Information
#
# Table name: dashboards
#
#  created_at :datetime         not null
#  id         :integer          not null, primary key
#  name       :string
#  updated_at :datetime         not null
#

class Dashboard < ApplicationRecord
  has_many :dashboard_items
end
