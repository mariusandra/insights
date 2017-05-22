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

require 'test_helper'

class DashboardItemTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
