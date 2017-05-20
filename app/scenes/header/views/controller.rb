class Header::Views::Controller < Controller
  def save_view
    if params[:path].present? && params[:name].present?
      view = View.create name: params[:name],
                         path: params[:path],
                         created_by: session[:user]

      render json: { success: true, view: view.as_json }
    else
      render json: { error: true }
    end
  end

  def get_views
    render json: { success: true, views: View.all.map { |view| view.as_json } }
  end
end
