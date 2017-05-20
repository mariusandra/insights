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
      facets_count: params[:facetsCount].present? ? params[:facetsCount].to_i : 6
    }

    response = Insights::Results.new(input_params).get_response

    render json: response

  rescue ActiveRecord::StatementInvalid => e
    if e.message.split("\n").first.include?('canceling statement due to statement timeout')
      render json: {
        error: 'Database Operation Timeout'
      }
    else
      raise e
    end
  end
end
