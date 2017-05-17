class Login::Controller < Controller
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
    end

    if defined?(INSIGHTS_LOGIN) && INSIGHTS_LOGIN.present?
      credentials = INSIGHTS_LOGIN

      if INSIGHTS_LOGIN.flatten.length > 2
        credentials = INSIGHTS_LOGIN.select { |k, v| k == user }.first
      end

      if credentials.present? && user == credentials[0] && password == credentials[1]
        render json: { success: true }
        session[:logged_in] = true
        session[:user] = user.strip
      else
        render json: { errors: { password: 'Incorrect username or password!' } }
      end
    else
      render json: { errors: { password: 'Something is weird on the backend' } }
    end
  end

  def logout
    reset_session
    render json: { success: true }
  end
end
