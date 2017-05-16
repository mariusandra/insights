# require 'slug_router'

Rails.application.routes.draw do

  # react routes
  kea_endpoint '_kea'

  kea_bundle :insights, prerender: false do
    get 'insights' => redirect('/insights/explorer')
    get 'insights/explorer', to: 'explorer/#index', as: :explorer
    get 'insights/url/:path', to: 'url/#open_url', as: :url
  end

  root to: redirect('/insights')
end
