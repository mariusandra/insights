class Url::Controller < Controller
  def create_url
    if params[:path].present?
      short_url = Insights::Url.create_short_url(params[:path], session[:user])

      render json: { path: short_url }
    else
      render json: { error: true }
    end
  end

  def open_url
    insights_url = InsightsUrl.find_by_code!(params[:path])
    redirect_to insights_url.path
  end
end
