import { kea } from 'kea'
import PropTypes from 'prop-types'

import { push } from 'connected-react-router'
import { put, take, call } from 'redux-saga/effects'

import client from 'lib/client'

export default kea({
  path: () => ['auth'],

  actions: () => ({
    loginStarted: true,
    loginSuccess: (token, user) => ({ token, user }),
    loginFailure: true,
    setRunningInElectron: true
  }),

  reducers: ({ actions }) => ({
    isLoggedIn: [false, PropTypes.bool, {
      [actions.loginStarted]: () => false,
      [actions.loginSuccess]: () => true,
      [actions.loginFailure]: () => false
    }],

    isLoggingIn: [false, PropTypes.bool, {
      [actions.loginStarted]: () => true,
      [actions.loginSuccess]: () => false,
      [actions.loginFailure]: () => false
    }],

    showLogin: [false, PropTypes.bool, {
      [actions.loginSuccess]: () => false,
      [actions.loginFailure]: () => true
    }],

    showApp: [false, PropTypes.bool, {
      [actions.loginSuccess]: () => true,
      [actions.loginFailure]: () => false
    }],

    token: [null, PropTypes.string, {
      [actions.loginSuccess]: (_, payload) => payload.token
    }],

    user: [{}, PropTypes.object, {
      [actions.loginSuccess]: (_, payload) => payload.user && payload.user._id ? payload.user : null
    }],

    runningInElectron: [false, PropTypes.bool, {
      [actions.setRunningInElectron]: () => true
    }]
  }),

  start: function * () {
    yield call(this.workers.authenticate)
  },

  workers: {
    authenticate: function * (credentials) {
      const { loginStarted, loginSuccess, loginFailure } = this.actions

      yield put(loginStarted())

      try {
        let authenticationResponse

        if (credentials) {
          const payload = Object.assign({ strategy: 'local' }, credentials)
          authenticationResponse = yield client.authenticate(payload)
        } else {
          try {
            authenticationResponse = yield client.reAuthenticate()
          } catch (e) {
            // try if we can use the "noLogin" authentication to get in
            authenticationResponse = yield client.authenticate({strategy: 'noLogin'})
          }
        }

        const { accessToken, user } = authenticationResponse

        yield put(loginSuccess(accessToken, user))
        return true
      } catch (error) {
        console.error(error)
        const showLogin = yield this.get('showLogin')
        yield put(loginFailure())

        if (!showLogin && !window.location.pathname.includes('/login')) {
          yield put(push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`))
        }
        return false
      }
    },

    waitUntilLogin: function * () {
      const { loginSuccess } = this.actions

      // wait until we're logged in
      const isLoggedIn = yield this.get('isLoggedIn')
      if (!isLoggedIn) {
        yield take(loginSuccess().type)
      }
    }
  }
})
