class Login::Controller < Controller
  skip_before_action :assure_insights_admin_access

  def index
    render_props_or_component
  end

  def check_login
    user = params[:user].try(:strip)
    password = params[:password]

    if user.blank? || password.blank?
      render json: {
        errors: {
          user: user.blank? ? 'Must be present' : nil,
          password: password.blank? ? 'Must be present' : nil
        }
      }
      return
    end

    if Insights::Authentication.login_required?
      if Insights::Authentication.successful?(user, password)
        login_success!
      else
        login_failure!
      end
    else
      render json: { errors: { password: "There's a disturbance in the force!" } }
    end
  end

  def logout
    reset_session
    render json: { success: true }
  end

private

  def login_success!
    session[:logged_in] = true
    session[:user] = params[:user].strip

    render json: { success: true }
  end

  def login_failure!
    render json: { errors: { password: 'Incorrect username or password!' } }
  end
end
