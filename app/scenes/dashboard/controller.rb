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
      path: params[:path]
    })
    dashboard_item.save!

    get_dashboards
  end

  def save_dashboard
    dashboard = Dashboard.find(params[:id])
    dashboard.mobile_layout = JSON.parse(params[:mobileLayout]).to_json
    dashboard.desktop_layout = JSON.parse(params[:desktopLayout]).to_json
    dashboard.save! if dashboard.changed?

    (params[:renamedItems] || []).each do |id, name|
      item = dashboard.dashboard_items.where(id: id).first
      if item.present?
        item.name = name
        item.save!
      end
    end

    (params[:deletedItems] || []).each do |id, name|
      item = dashboard.dashboard_items.where(id: id).first
      if item.present?
        item.destroy!
      end
    end

    get_dashboards
  end

private

  def dashboards_json
    Dashboard.all.map do |dashboard|
      dashboard_items = dashboard.dashboard_items.order(:created_at)
      dashboard_item_ids = dashboard_items.map { |i| i.id.to_s }

      layouts = {}

      [:desktop, :mobile].each do |type|
        json = dashboard.send("#{type}_layout")
        layouts[type] = json.present? ? JSON.parse(json) : []
        layouts[type] = layouts[type].select { |l| l['i'].in?(dashboard_item_ids) }

        layout_item_ids = layouts[type].map { |l| l['i'] }

        # add items not already in the desktop_layouts array, but which are on the dashboard (just added?)
        dashboard_items.select { |item| !item.id.to_s.in?(layout_item_ids) }.each do |item|
          layouts[type] << { i: item.id.to_s, x: 0, y: 0, w: type == :desktop ? 6 : 2, h: 10, moved: false, static: false }
        end
      end

      {
        id: dashboard.id,
        name: dashboard.name,
        layouts: layouts,
        items: dashboard_items.map { |item| [item.id.to_s, { id: item.id.to_s, name: item.name, path: item.path } ] }.to_h
      }
    end
  end
end
