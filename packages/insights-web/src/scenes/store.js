import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import { getStore } from 'kea'
import sagaPlugin from 'kea-saga'

export const history = createBrowserHistory()

export default getStore({
  paths: ['kea', 'scenes', 'auth'],
  reducers: {
    router: connectRouter(history)
  },
  middleware: [
    routerMiddleware(history)
  ],
  plugins: [
    sagaPlugin
  ]
})
