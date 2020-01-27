import React from 'react'
import { Provider } from 'react-redux'

import { resetContext, getContext } from 'kea'
import sagaPlugin from 'kea-saga'
import listenersPlugin from 'kea-listeners'

import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router'
import { Route, Switch } from 'react-router'
import { createBrowserHistory } from 'history'

import routes from './routes'

import Layout from './_layout'

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
    sagaPlugin({ useLegacyUnboundActions: true }),
    listenersPlugin
  ]
})

export default function Scenes() {
  return (
    <Provider store={getContext().store}>
      <ConnectedRouter history={history}>
        <Layout>
          <Switch>
            {Object.entries(routes).map(([path, Component]) => (
              <Route key={path} exact path={path} render={() => <Component />} />
            ))}
          </Switch>
        </Layout>
      </ConnectedRouter>
    </Provider>
  )
}
