module Insights::Adapters
  class SQL
    attr_accessor :connection
    attr_accessor :name

    def initialize(connection)
      @connection = connection
      @name = connection.adapter_name.downcase.to_sym
    end

    def quote(string)
      connection.quote(string)
    end

    def execute(sql)
      connection.execute(sql)
    end

    def allowed_date_truncations
      %w(hour day week month quarter year)
    end

    def allowed_aggregations
      %w(count sum min max avg)
    end

    def from_table_as(table_name, table_alias)
      "FROM \"#{table_name}\" AS \"#{table_alias}\""
    end

    def table_alias_with_column(table_alias, column)
      "\"#{table_alias}\".\"#{column}\""
    end

    def quoted_column_alias(column)
      "\"#{column}\""
    end

    def custom_sql_in_table_replace(sql, table_alias)
      (sql || '').gsub('$$.', "\"#{table_alias}\".")
    end

    def convert_sql_timezone(sql)
      sql
    end

    def truncate_date(sql, truncation)
      raise "Bad date truncation '#{truncation}'" unless truncation.to_s.in(allowed_date_truncations)
      sql
    end

    def add_aggregation(sql, aggregation)
      raise "Bad aggregation function '#{aggregation}'" unless aggregation.to_s.in(allowed_aggregations)

      if aggreagtion.to_s == 'count'
        "count(distinct #{sql})"
      else
        "#{aggregation}(#{sql})"
      end
    end

    def left_join(table_name, table_alias, table_key, other_alias, other_key)
      "LEFT JOIN \"#{table_name}\" \"#{table_alias}\" ON (\"#{table_alias}\".\"#{table_key}\" = \"#{other_alias}\".\"#{other_key}\")"
    end

    def connect_from_and_joins_array(array)
      array.join(' ')
    end

    def filter_empty(sql, type)
      if type == 'string'
        "((#{sql}) IS NULL OR (#{sql}) = '')"
      else
        "(#{sql}) IS NULL"
      end
    end

    def filter_present(sql, type)
      if type == 'string'
        "((#{sql}) IS NOT NULL AND (#{sql}) != '')"
      else
        "(#{sql}) IS NOT NULL"
      end
    end

    def filter_in(sql, string)
      "(#{sql}) in (#{string.split(/, ?/).map { |s| quote(s) }.join(', ')})"
    end

    def filter_not_in(sql, string)
      "(#{sql}) not in (#{string.split(/, ?/).map { |s| quote(s) }.join(', ')})"
    end

    def filter_equals(sql, type, string)
      "(#{sql}) = #{quote(string)}"
    end

    def filter_contains(sql, string)
      "(#{sql}) like #{quote('%' + string + '%')}"
    end

    def filter_between(sql, string)
      conditions = []

      start, finish = string.split(':')

      if start != '' && !start.nil?
        conditions << "(#{sql}) >= #{quote(start)}"
      end

      if finish != '' && !finish.nil?
        conditions << "(#{sql}) <= #{quote(finish)}"
      end

      conditions
    end

    def filter_date_range(sql, string)
      conditions = []

      start, finish = string.split(':')

      if start.present?
        date = start.to_date rescue nil
        if date.present?
          conditions << "(#{sql}) >= #{quote(date.to_s)}"
        end
      end

      if finish.present?
        date = finish.to_date rescue nil
        if date.present?
          conditions << "(#{sql}) < #{quote((date + 1.day).to_s)}"
        end
      end

      conditions
    end

    def where(conditions_array)
      "WHERE #{conditions_array.join(' AND ')}"
    end

    def having(conditions_array)
      "HAVING #{conditions_array.join(' AND ')}"
    end

    def group_by(group_parts_array)
      "GROUP BY #{group_parts_array.join(',')}"
    end

    def order_part(sql, descending)
      "#{sql} #{descending ? 'DESC' : 'ASC'}"
    end

    def order_by(order_parts_array)
      "ORDER BY #{order_parts_array.join(',')}"
    end

    def execute_count(from_and_joins, where_sql, group_sql, having_sql)
      count_sql = "SELECT count(*) as count #{from_and_joins} #{where_sql} #{group_sql} #{having_sql}"
      if group_sql.present?
        count_sql = "SELECT count(*) as count FROM (#{count_sql}) AS t"
      end

      count_results = execute(count_sql)
      count_results.first['count']
    end
  end
end
