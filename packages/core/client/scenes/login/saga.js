import Saga from 'kea/saga'
import { put, call } from 'redux-saga/effects'
import { push } from 'react-router-redux'

import messg from 'messg'

import { waitUntilLogin, authenticate } from '~/scenes/auth'
import loginLogic from '~/scenes/login/logic'

import delay from 'lib/utils/delay'

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
      'loginRequest'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.performLogin]: this.performLoginWorker
  })

  run = function * () {
    yield delay(50)
    yield call(waitUntilLogin)
    const path = getRedirectPath()
    yield put(push(path))
  }

  performLoginWorker = function * (action) {
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
    const result = yield call(authenticate, { email, password })

    if (result) {
      messg.success('Login success', 2500)
    } else {
      messg.error('Login failed', 2500)
      yield put(loginFailure({}))
    }
  }
}
