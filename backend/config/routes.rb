Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :awards, only: [:index, :show]
      resources :agencies, only: [:index, :show]
      resources :recipients, only: [:index, :show]

      get 'search/autocomplete', to: 'search#autocomplete'
      get 'search', to: 'search#index'

      get 'sync/status', to: 'sync#status'
      post 'sync/start', to: 'sync#start'

      get 'stats/overview', to: 'stats#overview'
      get 'stats/spending_over_time', to: 'stats#spending_over_time'
      get 'stats/by_agency', to: 'stats#by_agency'
      get 'stats/by_state', to: 'stats#by_state'
      get 'stats/by_type', to: 'stats#by_type'
    end
  end

  get 'health', to: proc { [200, {}, ['ok']] }
end