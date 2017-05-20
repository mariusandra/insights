# == Schema Information
#
# Table name: views
#
#  created_at :datetime         not null
#  created_by :string
#  id         :integer          not null, primary key
#  name       :string
#  path       :text
#  updated_at :datetime         not null
#

class View < ApplicationRecord
end
