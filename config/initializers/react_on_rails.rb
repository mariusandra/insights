# Shown below are the defaults for configuration
ReactOnRails.configure do |config|
  # Client bundles are configured in application.js

  # Server rendering:
  # Server bundle is a single file for all server rendering of components.
  config.generated_assets_dir = "app/assets/javascripts/react#{Rails.env.development? ? '-dev' : ''}"

  config.server_bundle_js_file = "server-bundle.js"
  # increase if you're on JRuby
  config.server_renderer_pool_size = 1
  # seconds
  config.server_renderer_timeout = 20
  # If set to true, this forces Rails to reload the server bundle if it is modified
  config.development_mode = Rails.env.development?
  # For server rendering. This can be set to false so that server side messages are discarded.
  # Default is true. Be cautious about turning this off.
  config.replay_console = Rails.env.development?
  # Default is true. Logs server rendering messags to Rails.logger.info
  config.logging_on_server = true

  # The following options can be overriden by passing to the helper method:

  # Default is false
  config.prerender = false
  # Default is true for development, off otherwise
  config.trace = Rails.env.development?

  config.rendering_extension = RenderingExtension

  config.npm_build_production_command = nil
  config.npm_build_test_command = nil

  # The server render method - either ExecJS or NodeJS
  config.server_render_method = "ExecJS"

  config.symlink_non_digested_assets_regex = nil

  config.raise_on_prerender_error = Rails.env.production?
end
