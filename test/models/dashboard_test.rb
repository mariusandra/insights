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

require 'test_helper'

class DashboardTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
