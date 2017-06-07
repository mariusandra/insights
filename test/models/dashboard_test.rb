# == Schema Information
#
# Table name: dashboards
#
#  created_at     :datetime         not null
#  deleted        :boolean          default(FALSE)
#  desktop_layout :text
#  id             :integer          not null, primary key
#  mobile_layout  :text
#  name           :string
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_dashboards_on_deleted  (deleted)
#

require 'test_helper'

class DashboardTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
