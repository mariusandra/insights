class Controller < ActionController::Base
  include Kea::Controller

  layout 'application'

  protect_from_forgery

  before_action :set_timezone
  before_action :set_default_props
  before_action :assure_insights_admin_access

  def index
    redirect_to explorer_path
  end

private

  def set_timezone
    Time.zone = INSIGHTS_TIMEZONE || 'Europe/Brussels'
  end

  def set_default_props
    @props = {}
  end

  def assure_insights_admin_access
    if Insights::Authentication.login_required? && !session[:logged_in]
      if request.format.symbol == :json
        render json: { error: 'Not authenticated. Please refresh and log in again.' }, status: 401
      else
        redirect_to login_path(redirect: request.fullpath)
      end
    end
  end
end
