import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import Popup from 'react-popup'

import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { FocusStyleManager } from '@blueprintjs/core'

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

FocusStyleManager.onlyShowFocusOnTabs()

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={getRoutes(App, store, routes)} />
  </Provider>,
  document.getElementById('root')
)

ReactDOM.render(
  <Popup />,
  document.getElementById('popupContainer')
)
