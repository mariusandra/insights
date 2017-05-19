class TargetDatabase < ActiveRecord::Base
  establish_connection INSIGHTS_DATABASE

  self.abstract_class = true
end
