module Insights
  class Adapter
    def self.create(connection = TargetDatabase.connection)
      database_adapter = connection.adapter_name.downcase.to_sym

      if database_adapter.in? %i(postgresql postgis)
        Insights::Adapters::Postgres.new(connection)
      elsif database_adapter == :sqlite
        Insights::Adapters::Sqlite.new(connection)
      else
        Insights::Adapters::SQL.new(connection)
      end
    end
  end
end
