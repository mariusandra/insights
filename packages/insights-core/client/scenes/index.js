import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import Popup from 'react-popup'

import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { getRoutes } from 'kea/scene'
import { FocusStyleManager } from "@blueprintjs/core";

import App from './_layout'
import routes from './routes'
import store from './store'

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
