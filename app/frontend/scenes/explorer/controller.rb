class Explorer::Controller < Controller
  def index
    render_props_or_component
  end

  def get_structure
    render json: Insights::Structure.get_structure
  end

  def get_results
    input_params = {
      sort: params[:sort],
      columns: params[:columns],
      filter: params[:filter] || [], # [{ key, value }]

      offset: params[:offset].try(:to_i) || 0,
      limit: params[:limit].try(:to_i) || 25,

      export: params[:export],
      export_title: params[:exportTitle],
      svg: params[:svg],

      percentages: !!params[:percentages],

      graph_time_filter: params[:graphTimeFilter] || 'last-60',
      graph_cumulative: !!params[:graphCumulative],

      facets_column: params[:facetsColumn],
      facets_count: params[:facetsCount].present? ? params[:facetsCount].to_i : 6,

      graph_only: !!params[:graphOnly]
    }

    response = Insights::Results.new(input_params).get_response

    if params[:export].present?
      if params[:export] == 'xlsx'
        export = Insights::Export::Xlsx.new(input_params, response)
      elsif params[:export] == 'pdf'
        export = Insights::Export::Pdf.new(input_params, response)
      end

      send_data export.data, type: export.type, filename: export.filename
    else
      render json: camelize_keys(response, 1)
    end

  rescue ActiveRecord::StatementInvalid => e
    if e.message.split("\n").first.include?('canceling statement due to statement timeout')
      render json: {
        error: 'Database Operation Timeout'
      }
    else
      raise e
    end
  end

protected

  def camelize_keys(object, limit = nil)
    new_object = {}

    object.each do |k, v|
      new_object[k.to_s.camelize(:lower).to_sym] = v.is_a?(Hash) && (limit.nil? || limit > 0) ? (limit.nil? ? camelize_keys(v) : camelize_keys(v, limit - 1)) : v
    end

    new_object
  end

end
