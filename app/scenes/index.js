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

import headerScene from '~/scenes/header/scene.js'

export const initFromProps = createAction('init from props', (props) => (props))

const isClientSide = typeof window !== 'undefined'

console.trace = function () {}

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

    // TODO: check why do we need to do this?
    match({routes: getRoutes(Layout, store, routes), location: railsContext.location}, () => {})

    store.dispatch(initFromProps(props))

    // custom scenes
    store.addKeaScene(headerScene, true)

    return (
      <Provider store={store}>
        <Router history={history} routes={getRoutes(Layout, store, routes)} />
      </Provider>
    )
  } else {
    // we aren't using this at the moment
  }
}

ReactOnRails.register({ AppContainer })
