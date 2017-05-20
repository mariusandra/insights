module Insights::Adapters
  class SQLite < SQL
    def allowed_date_truncations
      %w(hour day month year)
    end

    def truncate_date(sql, truncation)
      raise "Bad date truncation '#{truncation}'" unless truncation.to_s.in?(allowed_date_truncations)

      sql = super(sql)
      if truncation.to_s == 'day'
        "date(#{sql})"
      else
        "datetime(#{sql}, 'start of #{truncation}')"
      end
    end

    def filter_equals(sql, type, string)
      if type == 'boolean'
        "(#{sql}) = #{quote(string == 'true' ? 't' : 'f')}"
      else
        "(#{sql}) = #{quote(string)}"
      end
    end
  end
end
