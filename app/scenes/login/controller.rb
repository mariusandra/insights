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
      if INSIGHTS_LOGIN.is_a?(Proc)
        if INSIGHTS_LOGIN.call(user, password)
          login_success!
        else
          login_failure!
        end
      else
        credentials = INSIGHTS_LOGIN

        if INSIGHTS_LOGIN.flatten.length > 2
          credentials = INSIGHTS_LOGIN.select { |k, v| k == user }.first
        end

        if credentials.present? && user == credentials[0] && password == credentials[1]
          login_success!
        else
          login_failure!
        end
      end
    else
      render json: { errors: { password: 'Something is weird on the backend' } }
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
