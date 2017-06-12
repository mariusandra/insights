class Header::Share::Controller < Controller
  def create_url
    if params[:path].present?
      short_url = Insights::Url.create_short_url(params[:path], session[:user])

      render json: { path: short_url }
    else
      render json: { error: true }
    end
  end
end
