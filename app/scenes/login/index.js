import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components
import SubmitButton from 'lib/tags/submit-button'

// logic
import sceneLogic from '~/scenes/login/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = sceneLogic.constants

@connect({
  actions: [
    sceneLogic, [
      'setUser',
      'setPassword',
      'performLogin'
    ]
  ],
  props: [
    state => state.rails, [
      'loginNeeded'
    ],
    sceneLogic, [
      'user',
      'password',
      'errors',
      'isSubmitting'
    ]
  ]
})
export default class LoginScene extends Component {
  handleFormSubmit = (e) => {
    const { performLogin } = this.props.actions
    e.preventDefault()
    performLogin()
  }

  render () {
    const { user, password, errors, isSubmitting, loginNeeded } = this.props
    const { setUser, setPassword } = this.props.actions

    if (!loginNeeded) {
      // saga will redirect now
      // no need to flash the login form
      return (
        <div />
      )
    }

    return (
      <div className='login-scene'>
        <form className='login-box' onSubmit={this.handleFormSubmit}>
          <div className='logo'>
            Insights
          </div>
          <div className='field'>
            <label>user</label>
            <input autoFocus type='text' className='input-text' value={user} onChange={(e) => setUser(e.target.value)} />
          </div>
          {errors.user ? (
            <div className='simple-error'>{errors.user}</div>
          ) : null}
          <div className='field'>
            <label>password</label>
            <input type='password' className='input-text' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {errors.password ? (
            <div className='simple-error'>{errors.password}</div>
          ) : null}
          <div className='field'>
            <label />
            <SubmitButton type='submit' isSubmitting={isSubmitting}>Login</SubmitButton>
          </div>
        </form>
      </div>
    )
  }
}
