module Insights::Adapters
  class Postgres < SQL
    def convert_sql_timezone(sql)
      sql = "(#{sql} at time zone 'UTC' at time zone '#{Time.zone.name}')"
    end

    def allowed_date_truncations
      %w(hour day week month quarter year)
    end

    def truncate_date(sql, truncation)
      raise "Bad date truncation '#{truncation}'" unless truncation.to_s.in(allowed_date_truncations)
      "date_trunc('#{date_part}', #{sql})::date"
    end

    def filter_contains(sql, string)
      "(#{sql}) ilike #{quote('%' + string + '%')}"
    end
  end
end
