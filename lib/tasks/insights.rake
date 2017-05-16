require 'extensions'

namespace :insights do

  desc 'Export insights.yml'
  task :export => :environment do
    Insights::ExportModels.export
  end

end
