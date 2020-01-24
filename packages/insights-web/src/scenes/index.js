import React from 'react'
import { Provider } from 'react-redux'

import { resetContext, getContext } from 'kea'
import sagaPlugin from 'kea-saga'

import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router'
import { Route, Switch } from 'react-router' // react-router v4/v5
import { createBrowserHistory } from 'history'

import routes from './routes'

import App from './_layout'

export const history = createBrowserHistory()

resetContext({
  createStore: {
    paths: ['kea', 'scenes', 'auth'],
    reducers: {
      router: connectRouter(history)
    },
    middleware: [
      routerMiddleware(history)
    ],
  },
  plugins: [
    sagaPlugin({ useLegacyUnboundActions: true })
  ]
})

export default function Scenes() {
  return (
    <Provider store={getContext().store}>
      <ConnectedRouter history={history}>
        <App>
          <Switch>
            {Object.entries(routes).map(([path, Component]) => (
              <Route key={path} exact path={path} render={() => <Component />} />
            ))}
          </Switch>
        </App>
      </ConnectedRouter>
    </Provider>
  )
}
