# == Schema Information
#
# Table name: dashboard_items
#
#  created_at   :datetime         not null
#  dashboard_id :integer
#  h            :integer
#  id           :integer          not null, primary key
#  name         :string
#  path         :string
#  updated_at   :datetime         not null
#  w            :integer
#  x            :integer
#  y            :integer
#
# Indexes
#
#  index_dashboard_items_on_dashboard_id  (dashboard_id)
#

class DashboardItem < ApplicationRecord
  belongs_to :dashboard
end
