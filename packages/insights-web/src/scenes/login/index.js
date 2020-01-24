import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'

import SubmitButton from 'lib/tags/submit-button'

import sceneLogic from 'scenes/login/logic'
import sceneSaga from 'scenes/login/saga'


const logic = connect({
  actions: [
    sceneLogic, [
      'setEmail',
      'setPassword',
      'performLogin'
    ]
  ],
  props: [
    sceneLogic, [
      'email',
      'password',
      'errors',
      'isSubmitting'
    ]
  ],
  sagas: [
    sceneSaga
  ]
})

class LoginScene extends Component {
  handleFormSubmit = (e) => {
    const { performLogin } = this.props.actions
    e.preventDefault()
    performLogin()
  }

  render () {
    const { email, password, errors, isSubmitting } = this.props
    const { setEmail, setPassword } = this.props.actions

    return (
      <div className='login-scene'>
        <form className='login-box' onSubmit={this.handleFormSubmit}>
          <div className='logo'>
            <img src='/logo64.png' alt='' />
            Insights
          </div>
          <div className='field'>
            <label>email</label>
            <input autoFocus type='text' className='input-text' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {errors.email ? (
            <div className='simple-error'>{errors.email}</div>
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
          {/*<div className='field'>*/}
          {/*  <label />*/}
          {/*  <a href='http://localhost:3030/oauth/google'>Login with Google</a>*/}
          {/*</div>*/}
        </form>
      </div>
    )
  }
}

export default logic(LoginScene)
