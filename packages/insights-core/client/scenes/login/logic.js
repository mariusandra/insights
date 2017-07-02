import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class LoginLogic extends Logic {
  path = () => ['scenes', 'login', 'index']

  actions = ({ constants }) => ({
    setEmail: email => ({ email }),
    setPassword: password => ({ password }),
    setErrors: errors => ({ errors }),

    loginRequest: true,
    loginSuccess: true,
    loginFailure: errors => ({ errors }),

    performLogin: true
  })

  reducers = ({ actions, constants }) => ({
    email: ['', PropTypes.string, {
      [actions.setEmail]: (_, payload) => payload.email
    }],
    password: ['', PropTypes.string, {
      [actions.setPassword]: (_, payload) => payload.password
    }],
    errors: [{}, PropTypes.object, {
      [actions.setEmail]: () => ({}),
      [actions.setPassword]: () => ({}),
      [actions.performLogin]: () => ({}),
      [actions.loginFailure]: (_, payload) => payload.errors,
      [actions.setErrors]: (_, payload) => payload.errors
    }],
    isSubmitting: [false, PropTypes.bool, {
      [actions.loginRequest]: () => true,
      [actions.loginFailure]: () => false
    }]
  })
}
