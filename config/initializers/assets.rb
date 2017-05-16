# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

if Rails.env.development?
  Rails.application.config.assets.precompile += %w( react-dev/*.js )
else
  Rails.application.config.assets.precompile += %w( react/*.js react/*.css )
end

if Rails.env.test?
  Rails.application.config.assets.compress = false
  Rails.application.config.assets.compile = true
end
