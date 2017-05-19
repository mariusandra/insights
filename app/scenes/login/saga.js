import Saga from 'kea/saga'
import { put, select } from 'redux-saga/effects'

import messg from 'messg'

import controller from './controller.rb'

import loginLogic from '~/scenes/login/logic'

const DEFAULT_REDIRECT = '/explorer'

const getRedirectPath = () => {
  const pairs = (window.location.search || '?').split('?')[1].split('&').map(v => v.split('=', 2))
  return decodeURIComponent((pairs.filter(v => v[0] === 'redirect')[0] || [])[1] || DEFAULT_REDIRECT)
}

export default class LoginSaga extends Saga {
  actions = () => ([
    loginLogic, [
      'performLogin',
      'setErrors',
      'loginFailure',
      'loginSuccess',
      'loginRequest'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.performLogin]: this.performLoginWorker
  })

  run = function * () {
    const { loginNeeded, currentUser } = yield select(state => state.rails)

    if (currentUser || !loginNeeded) {
      window.location.href = getRedirectPath()
    }
  }

  performLoginWorker = function * (action) {
    const { setErrors, loginFailure, loginSuccess, loginRequest } = this.actions
    const { user, password } = yield loginLogic.fetch('user', 'password')

    let errors = {}

    if (!user.trim()) {
      errors.user = 'Must be present'
    }

    if (!password.trim()) {
      errors.password = 'Must be present'
    }

    if (Object.keys(errors).length > 0) {
      yield put(setErrors(errors))
      return
    }
    try {
      yield put(loginRequest())
      const result = yield controller.checkLogin({ user, password })

      if (result.success) {
        messg.success('Login success', 2500)
        yield put(loginSuccess())
        window.location.href = getRedirectPath()
      } else {
        messg.error('Login failed', 2500)
        yield put(loginFailure(result.errors || {}))
      }
    } catch (error) {
      messg.error('Login error', 2500)
      yield put(loginFailure({}))
    }
  }
}
