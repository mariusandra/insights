class Dashboard::Controller < Controller

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
end
