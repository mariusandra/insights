import { routerReducer, routerMiddleware } from 'react-router-redux'
import { browserHistory } from 'react-router'
import { getStore } from 'kea'
import sagaPlugin from 'kea-saga'

export default getStore({
  paths: ['kea', 'scenes', 'auth'],
  reducers: {
    routing: routerReducer
  },
  middleware: [
    routerMiddleware(browserHistory)
  ],
  plugins: [
    sagaPlugin
  ]
})
