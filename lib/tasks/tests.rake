require 'extensions'

namespace :insights do
  desc 'Make an exception'
  task :test_exception => :environment do
    1 / 0
  end
end
