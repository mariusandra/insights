class Url::Controller < Controller
  def open_url
    insights_url = InsightsUrl.find_by_code!(params[:path])
    redirect_to insights_url.path
  end
end
