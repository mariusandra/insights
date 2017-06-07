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

class Dashboard < ApplicationRecord
  has_many :dashboard_items

  scope :not_deleted, -> { where(deleted: false) }
end
