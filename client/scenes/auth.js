import Logic from 'kea/logic'
import { PropTypes } from 'react'

import { push } from 'react-router-redux'
import { put, take } from 'redux-saga/effects'

import client from '~/client'

class AuthLogic extends Logic {
  path = () => ['auth']

  actions = ({ constants }) => ({
    loginStarted: true,
    loginSuccess: (token, user) => ({ token, user }),
    loginFailure: true
  })

  reducers = ({ actions, constants }) => ({
    loginNeeded: [true, PropTypes.bool, {

    }],

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
      [actions.loginSuccess]: (_, payload) => payload.user
    }]
  })
}

const authLogic = new AuthLogic().init()
export default authLogic

export function * authenticate (credentials) {
  const { loginStarted, loginSuccess, loginFailure } = authLogic.actions

  yield put(loginStarted())

  try {
    const payload = credentials ? Object.assign({ strategy: 'local' }, credentials) : {}
    const authenticationResponse = yield client.authenticate(payload)
    const { accessToken, user } = authenticationResponse

    yield put(loginSuccess(accessToken, user))
    return true
  } catch (error) {
    const showLogin = yield authLogic.get('showLogin')
    yield put(loginFailure())

    if (!showLogin && !window.location.pathname.includes('/login')) {
      yield put(push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`))
    }
    return false
  }
}

export function * waitUntilLogin () {
  const { loginSuccess } = authLogic.actions

  // wait until we're logged in
  const isLoggedIn = yield authLogic.get('isLoggedIn')
  if (!isLoggedIn) {
    yield take(loginSuccess().type)
  }
}
