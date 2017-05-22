class Dashboard::Controller < Controller
  def index
    render_props_or_component
  end

  def get_dashboards
    render json: { dashboards: dashboards_json }
  end

  def add_dashboard
    if params[:name].present?
      Dashboard.create name: params[:name]
      get_dashboards
    else
      render json: { error: 'Please enter a name' }
    end
  end

  def add_to_dashboard
    dashboard = Dashboard.find(params[:id])
    dashboard_item = dashboard.dashboard_items.build({
      name: params[:name],
      path: params[:path],
      w: 6,
      h: 10,
      x: 0,
      y: 0
    })
    dashboard_item.save!

    get_dashboards
  end

private

  def dashboards_json
    Dashboard.all.map do |dashboard|
      {
        id: dashboard.id,
        name: dashboard.name,
        layout: dashboard.dashboard_items.order(:created_at).map do |item|
          {
            i: item.id.to_s,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            name: item.name,
            path: item.path
          }
        end
      }
    end
  end
end
