# == Schema Information
#
# Table name: dashboards
#
#  created_at     :datetime         not null
#  desktop_layout :text
#  id             :integer          not null, primary key
#  mobile_layout  :text
#  name           :string
#  updated_at     :datetime         not null
#

class Dashboard < ApplicationRecord
  has_many :dashboard_items
end
