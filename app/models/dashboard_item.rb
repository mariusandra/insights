# == Schema Information
#
# Table name: dashboard_items
#
#  created_at   :datetime         not null
#  dashboard_id :integer
#  id           :integer          not null, primary key
#  name         :string
#  path         :string
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_dashboard_items_on_dashboard_id  (dashboard_id)
#

class DashboardItem < ApplicationRecord
  belongs_to :dashboard
end
