module RenderingExtension

  # Return a Hash that contains custom values from the view context that will get merged with
  # the standard rails_context values and passed to all calls to generator functions used by the
  # react_component and redux_store view helpers
  def self.custom_context(view_context)
    {
      currentUser: view_context.session[:user],
      loginNeeded: defined?(INSIGHTS_LOGIN) && INSIGHTS_LOGIN.present?
    }
  end
end
