import { kea } from 'kea'
import { put, call } from 'redux-saga/effects'
import { push } from 'connected-react-router'

import { message } from 'antd'

import authLogic from 'scenes/auth'
import loginLogic from 'scenes/login/logic'

import delay from 'lib/utils/delay'

const DEFAULT_REDIRECT = '/explorer'

const getRedirectPath = () => {
  const pairs = (window.location.search || '?').split('?')[1].split('&').map(v => v.split('=', 2))
  return decodeURIComponent((pairs.filter(v => v[0] === 'redirect')[0] || [])[1] || DEFAULT_REDIRECT)
}

export default kea({
  path: () => ['scenes', 'login', 'saga'],

  connect: {
    actions: [
      loginLogic, [
        'performLogin',
        'setErrors',
        'loginFailure',
        'loginRequest'
      ]
    ]
  },

  takeEvery: ({ actions, workers }) => ({
    [actions.performLogin]: workers.performLogin
  }),

  start: function * () {
    yield delay(50)
    yield call(authLogic.workers.waitUntilLogin)
    const path = getRedirectPath()
    yield put(push(path))
  },

  workers: {
    performLogin: function * (action) {
      const { setErrors, loginFailure, loginRequest } = this.actions
      const { email, password } = yield loginLogic.fetch('email', 'password')

      let errors = {}

      if (!email.trim()) {
        errors.email = 'Must be present'
      }

      if (!password.trim()) {
        errors.password = 'Must be present'
      }

      if (Object.keys(errors).length > 0) {
        yield put(setErrors(errors))
        return
      }

      yield put(loginRequest())
      const result = yield call(authLogic.workers.authenticate, { email, password })

      if (!result) {
        message.error('Login failed')
        yield put(loginFailure({}))
      }
    }
  }
})
