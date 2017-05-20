module Insights
  class Results
    attr_accessor :params, :adapter, :structure

    # params = {
    #   sort: params[:sort],
    #   columns: params[:columns],
    #   filter: params[:filter] || [], # [{ key, value }]
    #
    #   offset: params[:offset].try(:to_i) || 0,
    #   limit: params[:limit].try(:to_i) || 25,
    #
    #   export: params[:export],
    #   export_title: params[:exportTitle],
    #   svg: params[:svg],
    #
    #   percentages: !!params[:percentages],
    #
    #   graph_time_filter: params[:graphTimeFilter] || 'last-60',
    #   graph_cumulative: !!params[:graphCumulative],
    #
    #   facets_column: params[:facetsColumn],
    #   facets_count: params[:facetsCount].present? ? params[:facetsCount].to_i : 6
    # }

    def initialize(params)
      @params = params

      @adapter = Insights::Adapter.create
      @structure = Insights::Structure.get_structure
    end

    def get_response
      reset_cache!

      # common
      set_joins_and_column_metadata!
      set_filter!

      # table
      set_group!
      set_sort!
      set_limit!

      get_count!
      get_results!

      # graph
      get_graph!

      set_response!

      @response
    end

    def reset_cache!
      @base_model_name = nil
      @column_metadata = []
      @results_table_columns = []

      @common_sql_conditions = {
        having: [],
        where: []
      }

      @common_sql_parts = {
        from_and_joins: nil,
        where: nil,
        having: nil
      }

      @results_table_count = 1

      @results_table_sql_parts = {
        select: nil,
        group: nil,
        sort: nil,
        limit: nil,
        offset: nil
      }

      @final_results = []

      @graph_response = nil

      @response = nil
    end

    def set_joins_and_column_metadata!
      # input params
      columns = params[:columns]
      filter = params[:filter]

      # are we requesting any data?
      if columns.blank?
        raise "No columns selected"
      end

      # the model we're requesting must exist
      @base_model_name = columns.first.split('.').first
      if structure[@base_model_name].blank?
        raise "Base model \"#{@base_model_name}\" not found"
      end

      # get all the columns we must be able to access (results table + filter)
      filter_columns = filter.map { |v| v[:key] }.uniq
      columns_to_join = (columns + filter_columns).uniq

      # each requested column must be for this model
      if columns_to_join.select { |s| s.split('.').first != @base_model_name }.count > 0
        raise "Each column must be from the same base model!"
      end

      # counters for value and table aliases
      table_counter = 0
      value_counter = 0

      # add the base model's path to the "join list"
      base_table_name = structure[@base_model_name]['table_name']
      base_table_alias = "$T#{table_counter}" # "$T0"

      joins = {
        @base_model_name => {
          alias: base_table_alias,
          sql: adapter.from_table_as(base_table_name, base_table_alias) # "FROM base_table_name AS base_table_alias"
        }
      }

      # make sure we have access to each of the columns we need
      columns_to_join.each do |column|
        # each incoming column is in the format "path!transform!aggregate"
        # e.g. "Order.order_lines.created_at!month!max"
        path, transform, aggregate = column.gsub('$', '!').split('!', 3)

        # we will split the path by "." and follow the links going forward, adding joins when needed

        # always starting the traverse from the base model
        node = structure[@base_model_name]
        table_alias = base_table_alias

        # log of how far we have gotten. empty at first
        traversed_path = []

        # remove the modal from the path, so "Order.order_lines.created_at" -> "order_lines.created_at"
        local_path = path.split('.')[1..-1]

        local_path.each do |key|
          # if the next part of the key is a column, deal with it
          # (alternatively, if it's a link to a model, and we'll deal with it below in the "else")
          if node['columns'][key] || node['custom'][key]
            meta = nil # from insights.yml
            sql = nil # how to access this field
            sql_before_transform = nil

            # get meta and sql
            if node['columns'][key]
              meta = node['columns'][key]
              sql = adapter.table_alias_with_column(table_alias, key)
            elsif node['custom'][key]
              meta = node['custom'][key]
              sql = adapter.custom_sql_in_table_replace(meta['sql'], table_alias)
            end

            # perform date conversion if needed
            if meta['type'].to_s == 'time'
              sql = adapter.convert_sql_timezone(sql)

              if transform.present?
                sql_before_transform = sql
                sql = adapter.truncate_date(sql, transform)
              end
            end

            # add aggregation functions (count(...), etc)
            if aggregate.present?
              sql = adapter.add_aggregation(sql, aggregate)
            end

            metadatum_object = {
              column: column,
              path: path,
              table: table_alias,
              key: key,
              sql: sql,
              sql_before_transform: sql_before_transform,
              alias: "$V#{value_counter}",
              type: meta['type'].to_s,
              url: meta['url'],
              model: node['model'],
              transform: transform,
              aggregate: aggregate.present? ? aggregate : nil,
              index: meta['index']
            }

            @column_metadata << metadatum_object

            # is this a column that is present in the results table?
            if columns.include?(column)
              @results_table_columns << metadatum_object
            end

            value_counter += 1

          # the current traversed node is a link to a new model (foreign key)
          elsif node['links']['incoming'][key] || node['links']['outgoing'][key]
            # details of the link
            link_meta = node['links']['incoming'][key] || node['links']['outgoing'][key]

            # remember the node's table's alias for the join
            last_table_alias = table_alias

            # take the next node
            node = structure[link_meta['model']]

            # add this to the traversed path
            traversed_path << key

            # if we already joined this table, reuse the old name
            if joins[traversed_path.join('.')].present?
              table_alias = joins[traversed_path.join('.')][:name]

            # otherwise add it to the joins list
            else
              table_counter += 1
              table_alias = "$T#{table_counter}"

              joins[traversed_path.join('.')] = {
                alias: table_alias,
                sql: adapter.left_join(node['table_name'], table_alias, link_meta['model_key'], last_table_alias, link_meta['my_key'])
              }
            end
          end
        end
      end

      # save the table "from ... join ... join ..." sql
      @common_sql_parts[:from_and_joins] = adapter.connect_from_and_joins_array(joins.map { |key, join| join[:sql] })
    end

    def set_filter!
      filter = params[:filter]

      return if filter.blank?

      where_conditions = []
      having_conditions = []

      filter.each do |filter_object|
        column = filter_object[:key]
        condition = filter_object[:value]
        meta = @column_metadata.select { |v| v[:column] == column }.first

        next if meta.blank?

        conditions = []

        if condition == 'null'
          conditions << adapter.filter_empty(meta[:sql], meta[:type])
        elsif condition == 'not null'
          conditions << adapter.filter_present(meta[:sql], meta[:type])
        elsif condition.start_with? 'in:'
          conditions << adapter.filter_in(meta[:sql], condition[3..-1])
        elsif condition.start_with? 'not_in:'
          conditions << adapter.filter_not_in(meta[:sql], condition[7..-1])
        elsif condition.start_with? 'equals:'
          conditions << adapter.filter_equals(meta[:sql], meta[:type], condition[7..-1])
        elsif condition.start_with? 'contains:'
          conditions << adapter.filter_contains(meta[:sql], condition[9..-1])
        elsif condition.start_with? 'between:'
          conditions += adapter.filter_between(meta[:sql], condition[8..-1])
        elsif condition.start_with? 'date_range:'
          conditions += adapter.filter_date_range(meta[:sql], condition[11..-1])
        end

        if meta[:aggregate]
          having_conditions += conditions
        else
          where_conditions += conditions
        end
      end

      @common_sql_conditions[:where] = where_conditions
      @common_sql_conditions[:having] = having_conditions

      @common_sql_parts[:where] = adapter.where(where_conditions) if where_conditions.present?
      @common_sql_parts[:having] = adapter.having(having_conditions) if having_conditions.present?
    end

    def set_group!
      aggregate_columns = @column_metadata.select { |v| v[:aggregate].present? }
      return if aggregate_columns.blank?

      group_parts = @column_metadata.select { |v| v[:aggregate].blank? }.map { |v| v[:sql] }
      return if group_parts.blank?

      @results_table_sql_parts[:group] = adapter.group_by(group_parts)
    end

    def set_sort!
      sort_column = params[:sort]
      sort_descending = false

      if sort_column.present? && sort_column.start_with?('-')
        sort_column = sort_column[1..-1]
        sort_descending = true
      end

      sort_parts = []

      # add the requested sort column into sort_parts, if it's something we have access to
      if sort_column.present?
        sort_value = @column_metadata.select { |v| v[:column] == sort_column }.first
        if sort_value.present? && sort_value[:sql].present?
          sort_parts << adapter.order_part(sort_value[:sql], sort_descending)
        end
      end

      # also add the primary key of the base model to the list, to keep the results table stable
      # otherwise when scrolling things can shift around annoyingly
      base_table_alias = '$T0' # hardcoded for now
      first_primary = structure[@base_model_name]['columns'].select { |k, v| v['index'].to_s == 'primary' }.first.try(:first)
      no_aggregate = @column_metadata.select { |v| v[:aggregate].present? }.blank?

      if first_primary.present? && no_aggregate
        column_sql = adapter.table_alias_with_column(base_table_alias, first_primary)
        sort_parts << adapter.order_part(column_sql, false)
      end

      return if sort_parts.blank?

      @results_table_sql_parts[:sort] = adapter.order_by(sort_parts)
    end

    def set_limit!
      @results_table_sql_parts[:offset] = params[:offset].try(:to_i) || 0
      @results_table_sql_parts[:limit] = params[:limit].try(:to_i) || 25

      if params[:export] == 'xlsx'
        @results_table_sql_parts[:offset] = 0
        @results_table_sql_parts[:limit] = 65535
      end
    end

    def get_count!
      non_aggregate_columns = @column_metadata.select { |v| v[:aggregate].blank? }

      return if non_aggregate_columns.blank?

      @results_table_count = adapter.get_count(
        from_and_joins: @common_sql_parts[:from_and_joins],
        where: @common_sql_parts[:where],
        having: @common_sql_parts[:having],
        group: @results_table_sql_parts[:group]
      )
    end

    def get_results!
      # set what to select
      @results_table_sql_parts[:select] = adapter.value_list_to_select(@results_table_columns)

      # get the results from the database
      results = adapter.get_results(@common_sql_parts.merge(@results_table_sql_parts))

      # get the keys used in the results
      column_aliases = @results_table_columns.map { |v| v[:alias] }

      # convert to an array
      @final_results = results.map do |row|
        column_aliases.map { |a| row[a] }
      end
    end

    def get_graph!
      graph_time_filter = params[:graph_time_filter] || 'last-60'
      graph_cumulative = params[:graph_cumulative]

      facets_count = params[:facets_count].present? ? params[:facets_count].to_i : 6
      facets_column_key = params[:facets_column]

      # see what we have to work with
      time_columns = @results_table_columns.select { |v| v[:type] == 'time' && v[:aggregate].blank? }
      aggregate_columns = @results_table_columns.select { |v| v[:aggregate].present? }

      # must have at least 1 aggregate and exactly 1 time column
      return if aggregate_columns.count < 1 || time_columns.count != 1

      # graph time
      time_column = time_columns.first

      # day? week? month?
      time_group = time_column[:transform].present? ? time_column[:transform].to_sym : :day

      # start and end of the graph timeline (or nil)
      first_date, last_date = get_times_from_string(graph_time_filter, 0, time_group)

      # add the date truncation transform to the columns if none present
      time_columns = time_columns.map do |v|
        v.merge({ transform: time_group.to_s, sql: adapter.truncate_date(v[:sql_before_transform], time_group.to_s) })
      end

      # sort by time
      graph_sort_parts = [adapter.order_part(time_column[:sql], false)]
      graph_sort_sql = adapter.order_by(graph_sort_parts)

      # limit the results to what's visible on the graph
      graph_where_conditions = @common_sql_conditions[:where].dup
      if first_date.present? && last_date.present?
        graph_where_conditions << adapter.filter_date_range(time_column[:sql], "#{first_date.to_s}:#{last_date.to_s}")
      end
      graph_where_sql = adapter.where(graph_where_conditions)

      # facets column
      facets_column = nil
      facets_columns = []

      if facets_column_key.present?
        facets_columns = @results_table_columns.select do |v|
          v[:type].in?(%w(string boolean)) && v[:aggregate].blank? && v[:column] == facets_column_key
        end.first(1)
        facets_column = facets_columns.first
      end

      facet_values = []

      # grouping
      graph_group_parts = (time_columns + aggregate_columns + facets_columns).select { |v| v[:aggregate].blank? }.map { |v| v[:sql] }
      graph_group_sql = adapter.group_by(graph_group_parts)

      # if we're faceting, see if we need to limit the facets
      if facets_column.present?
        facet_values, has_other = adapter.get_facet_values_and_has_other(
          column: facets_column[:sql],
          from_and_joins: @common_sql_parts[:from_and_joins],
          where: graph_where_sql,
          group: graph_group_sql,
          having: @common_sql_parts[:having],
          limit: facets_count
        )

        # there are no values in the column, remove the facets
        if facet_values.blank?
          facets_column = nil
          facets_columns = []

        # there are values. do we have all of them, or must we add an "other"?
        elsif facets_column[:type] == 'string' && has_other
          facet_other = facet_values.include?('Other') ? '__OTHER__' : 'Other'
          facets_column = facets_column.merge({
            sql: adapter.faceted_values_or_other(facets_column[:sql], facet_values, facet_other)
          })
          facets_columns = [facets_column]
          facet_values << facet_other
        end
      end

      # regroup in case something changed
      graph_group_parts = (time_columns + aggregate_columns + facets_columns).select { |v| v[:aggregate].blank? }.map { |v| v[:sql] }
      graph_group_sql = adapter.group_by(graph_group_parts)

      # graph results
      graph_select_values = time_columns + aggregate_columns + facets_columns
      graph_select_sql = adapter.value_list_to_select(graph_select_values)

      # raw results from sql
      graph_results = adapter.get_results(
        select: graph_select_sql,
        from_and_joins: @common_sql_parts[:from_and_joins],
        where: graph_where_sql,
        group: graph_group_sql,
        having: @common_sql_parts[:having],
        sort: graph_sort_sql,
        limit: 10000,
        offset: 0
      )

      # save the results in a hash with dates as keys... and all aggregate columns with facets as values
      result_hash = {}

      graph_results.each do |r|
        date = r[time_column[:alias]].to_date.to_s
        result_hash[date] ||= { time: date }

        aggregate_columns.each do |aggregate_column|
          key = aggregate_column[:column]
          facets_columns.each do |c|
            key += "$$#{r[c[:alias]]}"
          end
          result_hash[date][key] = r[aggregate_column[:alias]]
        end
      end

      # each hash in the result_hash should have all_keys set
      all_keys = []
      aggregate_columns.each do |aggregate_column|
        key = aggregate_column[:column]
        if facet_values.present?
          facet_values.each do |v|
            all_keys << "#{key}$$#{v}"
          end
        else
          all_keys << key
        end
      end

      # get the first and last dates if not already set
      first_date = result_hash.keys.min.try(:to_date) if first_date.blank?
      last_date = result_hash.keys.max.try(:to_date) if last_date.blank?

      # calculate all the dates that should be in the results
      all_dates = []
      if first_date.present? && last_date.present?
        (first_date..last_date).each do |date|
          # could be optimised... but whatever, it's not going to be a huge loop
          next if time_group == :year && (date.day != 1 || date.month != 1)
          next if time_group == :quarter && !(date.day == 1 && date.month.in?([1, 4, 7, 10]))
          next if time_group == :month && date.day != 1
          next if time_group == :week && date.wday != 1

          all_dates << date
        end
      end

      # make sure all the dates have all the values present (as 0 if nil)
      if all_dates.present?
        empty_hash = all_keys.map { |k| [k, 0] }.to_h

        all_dates.each do |date|
          if result_hash[date.to_s].blank?
            result_hash[date.to_s] = { time: date.to_s }.merge(empty_hash)
          else
            all_keys.each do |key|
              if result_hash[date.to_s][key].nil?
                result_hash[date.to_s][key] = 0
              end
            end
          end
        end
      end

      # if we're asking for a cumulative response, sum all the values
      if graph_cumulative
        count_hash = all_keys.map { |k| [k, 0] }.to_h
        all_dates.each do |date|
          all_keys.each do |key|
            count_hash[key] += result_hash[date.to_s][key].try(:to_f) || 0
            result_hash[date.to_s][key] = count_hash[key]
          end
        end
      end

      @graph_response = {
        meta: graph_select_values.map { |v| v.slice(:column, :path, :type, :url, :key, :model, :aggregate, :transform, :index) },
        keys: all_keys,
        facets: facet_values,
        results: result_hash.values.sort_by { |h| h[:time] },
        time_group: time_group.to_s
      }
    end

    def set_response!
      @response = {
        success: true,

        columns: @results_table_columns.map { |v| v[:column] },
        columns_meta: @column_metadata.map { |v| [v[:column], v.slice(:column, :path, :type, :url, :key, :model, :aggregate, :transform, :index)] }.to_h,
        results: @final_results,
        count: @results_table_count,
        offset: @results_table_sql_parts[:offset],
        limit: @results_table_sql_parts[:limit],

        sort: params[:sort],
        filter: params[:filter],

        graph: @graph_response,

        facets_column: params[:facets_column] || nil,
        facets_count: params[:facets_count],
        graph_time_filter: params[:graph_time_filter] || 'last-60',
        graph_cumulative: params[:graph_cumulative],

        percentages: params[:percentages]
      }
    end

  protected

    # convert 'last-365', etc to start and end dates
    def get_times_from_string(time_filter, smooth = 0, time_group = :day)
      if time_filter =~ /\A20[0-9][0-9]\z/
        year = time_filter.to_i
        first_date = "#{year}-01-01".to_date - (smooth.present? ? smooth.to_i.days : 0)
        last_date = "#{year+1}-01-01".to_date - 1.day
      elsif time_filter == 'this-month-so-far'
        first_date = Time.new.to_date - Time.new.day + 1.day
        last_date = Time.new.to_date
      elsif time_filter == 'this-month'
        first_date = Time.new.to_date - Time.new.day + 1.day
        last_date = first_date + 1.month - 1.day
      elsif time_filter == 'last-month'
        first_date = Time.new.to_date - Time.new.day + 1.day - 1.month
        last_date = first_date + 1.month - 1.day
      elsif time_filter =~ /\Alast-([0-9]+)\z/
        day_count = time_filter.split('last-').last.to_i
        day_count += smooth.to_i if smooth.present?
        first_date = day_count.days.ago.to_date
        if time_group == :month
          first_date -= (first_date.day - 1).days
        elsif time_group == :week
          wday = first_date.wday
          first_date -= (wday == 0 ? 6 : wday - 1).days
        end
        last_date = Time.new.to_date
      end
      [first_date, last_date]
    end
  end
end
