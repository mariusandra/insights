import { Provider } from 'react-redux'
import React from 'react'

import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import store from './store'
import App from './_layout'
import routes from './routes'

function lazyLoad (store, lazyLoadableModule) {
  return (location, cb) => {
    lazyLoadableModule(module => {
      const component = module.default
      cb(null, component)
    })
  }
}

export function getRoutes (App, store, routes) {
  return {
    component: App,
    childRoutes: Object.keys(routes).map(route => ({
      path: route,
      getComponent: lazyLoad(store, routes[route])
    }))
  }
}

const history = syncHistoryWithStore(browserHistory, store)

export default function Scenes() {
  return (
    <Provider store={store}>
      <Router history={history} routes={getRoutes(App, store, routes)} />
    </Provider>
  )
}
