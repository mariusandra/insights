class Login::Controller < Controller
  def index
    render_props_or_component
  end

  def check_login
    user = params[:user]
    password = params[:password]

    if user.blank? || password.blank?
      render json: {
        errors: {
          user: user.blank? ? 'Must be present' : nil,
          password: password.blank? ? 'Must be present' : nil
        }
      }
    end

    if defined?(INSIGHTS_LOGIN) && INSIGHTS_LOGIN.flatten.length == 2
      if user.strip == INSIGHTS_LOGIN[0] && password == INSIGHTS_LOGIN[1]
        render json: { success: true }
      else
        render json: { errors: { password: 'Incorrect password!' } }
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
