import { Provider } from 'react-redux'
import React from 'react'

import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router' // react-router v4/v5

import store, { history } from './store'
import App from './_layout'
import routes from './routes'

export default function Scenes() {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App>
          <Switch>
            {Object.entries(routes).map(([path, Component]) => (
              <Route exact path={path} render={() => <Component />} />
            ))}
          </Switch>
        </App>
      </ConnectedRouter>
    </Provider>
  )
}
