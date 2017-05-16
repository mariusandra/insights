class Url::Controller < Controller
  def create_url
    if params[:path].present?
      insights_url = InsightsUrl.create code: SecureRandom.urlsafe_base64,
                                        path: params[:path] # ,
                                        # user: current_user
      render json: { path: "/insights/url/#{insights_url.code}" }
    else
      render json: { error: true }
    end
  end

  def open_url
    redirect_to InsightsUrl.find_by_code(params[:path]).path
  end
end
