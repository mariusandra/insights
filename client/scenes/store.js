/* global window */

import { createStore, applyMiddleware, compose } from 'redux'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'
import { browserHistory } from 'react-router'
import { createRootSaga, createKeaStore } from 'kea/scene'

import headerScene from '~/scenes/header/scene'

import authLogic, { authenticate } from '~/scenes/auth'

const appReducers = {
  routing: routerReducer,
  auth: authLogic.reducer
}

function * appSaga () {
}

const sagaMiddleware = createSagaMiddleware()
const finalCreateStore = compose(
  applyMiddleware(sagaMiddleware),
  applyMiddleware(routerMiddleware(browserHistory)),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)

const store = createKeaStore(finalCreateStore, appReducers)

sagaMiddleware.run(authenticate)
sagaMiddleware.run(createRootSaga(appSaga))

store.addKeaScene(headerScene, true)

export default store
