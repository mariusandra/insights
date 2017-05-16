/* global I18n */
import { Provider } from 'react-redux'
import React from 'react'

import { Router, browserHistory, match, RouterContext } from 'react-router'
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createAction } from 'kea/logic'
import { getRoutes, createRootSaga, createKeaStore } from 'kea/scene'
import ReactOnRails from 'react-on-rails'

import Layout from './_layout'
import routes from './routes'

export const initFromProps = createAction('init from props', (props) => (props))

const isClientSide = typeof window !== 'undefined'

console.trace = function () {}

function routesWithRootPath (routes, railsContext) {
  const { location, languageUrl } = railsContext

  const rootPath = `/${languageUrl}`
  if (location === rootPath || location.indexOf(rootPath + '/') === 0) {
    let newRoutes = {}

    Object.keys(routes).forEach(route => {
      if (route === '/') {
        newRoutes[rootPath] = routes[route]
      }
      newRoutes[rootPath + route] = routes[route]
    })

    return newRoutes
  } else {
    return routes
  }
}

const AppContainer = (props, railsContext) => {
  function * appSaga () {
  }

  const appReducers = {
    routing: routerReducer,
    rails: () => railsContext
  }

  if (isClientSide) {
    const sagaMiddleware = createSagaMiddleware()
    const finalCreateStore = compose(
      applyMiddleware(sagaMiddleware),
      applyMiddleware(routerMiddleware(browserHistory)),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )(createStore)

    const store = createKeaStore(finalCreateStore, appReducers)
    sagaMiddleware.run(createRootSaga(appSaga))

    const history = syncHistoryWithStore(browserHistory, store)
    const newRoutes = routesWithRootPath(routes, railsContext)

    // TODO: check why do we need to do this?
    match({routes: getRoutes(Layout, store, newRoutes), location: railsContext.location}, () => {})

    store.dispatch(initFromProps(props))

    return (
      <Provider store={store}>
        <Router history={history} routes={getRoutes(Layout, store, newRoutes)} />
      </Provider>
    )
  } else {
    const store = createKeaStore(createStore, appReducers)

    let error
    let redirectLocation
    let routeProps

    const { location } = railsContext

    const newRoutes = routesWithRootPath(routes, railsContext)

    // See https://github.com/reactjs/react-router/blob/master/docs/guides/ServerRendering.md
    match({routes: getRoutes(Layout, store, newRoutes), location}, (_error, _redirectLocation, _routeProps) => {
      error = _error
      redirectLocation = _redirectLocation
      routeProps = _routeProps
    })

    // This tell react_on_rails to skip server rendering any HTML. Note, client rendering
    // will handle the redirect. What's key is that we don't try to render.
    // Critical to return the Object properties to match this { error, redirectLocation }
    if (error || redirectLocation) {
      return { error, redirectLocation }
    }

    initLocale(railsContext.i18nLocale)
    store.dispatch(initFromProps(props))

    // Important that you don't do this if you are redirecting or have an error.
    return (
      <Provider store={store}>
        <RouterContext {...routeProps} />
      </Provider>
    )
  }
}

ReactOnRails.register({ AppContainer })
