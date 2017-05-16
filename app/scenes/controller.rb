class Controller < ActionController::Base
  include Kea::Controller

  protect_from_forgery

  before_action :check_insights_admin
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

  def check_insights_admin
  end
end
