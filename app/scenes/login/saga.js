import Saga from 'kea/saga'
import { put } from 'redux-saga/effects'

import messg from 'messg'

import controller from './controller.rb'

import loginLogic from '~/scenes/login/logic'

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
    // const { doSomething } = this.actions

    console.log('Starting login saga')

    // while (true) {
    //   const propertyName = yield loginLogic.get('propertyName')
    //   yield put(doSomething(propertyName + '!'))
    // }
  }

  cancelled = function * () {
    console.log('Stopping login saga')
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
      console.log(result)
      if (result.success) {
        yield put(loginSuccess())
        debugger
      } else {
        messg.error('Login failed', 2500)
        yield put(loginFailure(result.errors))
      }
    } catch (error) {
      messg.error('Login error', 2500)
      yield put(loginFailure({}))
    }
  }
}
