class TargetDatabase < ActiveRecord::Base
  establish_connection Rails.configuration.database_configuration['target_database']

  self.abstract_class = true
end
