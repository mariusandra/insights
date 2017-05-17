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
    sceneLogic, [
      'user',
      'password',
      'errors',
      'isSubmitting'
    ]
  ]
})
export default class LoginScene extends Component {
  render () {
    const { user, password, errors, isSubmitting } = this.props
    const { setUser, setPassword, performLogin } = this.props.actions

    return (
      <div className='login-scene'>
        <div className='login-box'>
          <div className='logo'>
            Insights
          </div>
          <div className='field'>
            <label>user</label>
            <input type='text' className='input-text' value={user} onChange={(e) => setUser(e.target.value)} />
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
            <SubmitButton onClick={performLogin} isSubmitting={isSubmitting}>Login</SubmitButton>
          </div>
        </div>
      </div>
    )
  }
}
