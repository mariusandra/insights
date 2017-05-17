import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class LoginLogic extends Logic {
  path = () => ['scenes', 'login', 'index']

  actions = ({ constants }) => ({
    setUser: user => ({ user }),
    setPassword: password => ({ password }),
    setErrors: errors => ({ errors }),

    loginRequest: true,
    loginSuccess: true,
    loginFailure: errors => ({ errors }),

    performLogin: true
  })

  reducers = ({ actions, constants }) => ({
    user: ['', PropTypes.string, {
      [actions.setUser]: (_, payload) => payload.user,
      [actions.loginSuccess]: () => ''
    }],
    password: ['', PropTypes.string, {
      [actions.setPassword]: (_, payload) => payload.password,
      [actions.loginSuccess]: () => ''
    }],
    errors: [{}, PropTypes.object, {
      [actions.setUser]: () => ({}),
      [actions.setPassword]: () => ({}),
      [actions.performLogin]: () => ({}),
      [actions.loginFailure]: (_, payload) => payload.errors,
      [actions.setErrors]: (_, payload) => payload.errors
    }],
    isSubmitting: [false, PropTypes.bool, {
      [actions.loginRequest]: () => true,
      [actions.loginSuccess]: () => false,
      [actions.loginFailure]: () => false
    }]
  })
}
