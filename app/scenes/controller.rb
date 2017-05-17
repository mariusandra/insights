class Controller < ActionController::Base
  include Kea::Controller

  protect_from_forgery

  before_action :set_timezone

  layout 'application'

  before_action do
    @props = {}
  end

  def index
    redirect_to explorer_path
  end

protected

private

  def set_timezone
    Time.zone = INSIGHTS_TIMEZONE || 'Europe/Brussels'
  end

  def assure_insights_admin_access
    if session[:logged_in] == true && session[:user].present?
      true
    elsif defined?(INSIGHTS_LOGIN) && INSIGHTS_LOGIN.present?
      redirect_to login_path(redirect: request.fullpath)
    end
  end
end
