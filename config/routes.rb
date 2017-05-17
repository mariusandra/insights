# require 'slug_router'

Rails.application.routes.draw do

  kea_endpoint '_kea'

  kea_bundle :insights, prerender: false do
    get 'explorer', to: 'explorer/#index', as: :explorer
    get 'url/:path', to: 'url/#open_url', as: :url
  end

  # old routes
  # get '/insights/*path' => redirect('/%{path}')
  get '/insights/*redirect_path' => redirect { |params, request| "/#{request.params['redirect_path']}?#{request.params.to_query}" }

  root to: redirect('/explorer')

end
