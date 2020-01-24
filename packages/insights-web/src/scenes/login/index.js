import './styles.scss'

import React from 'react'
import { useActions, useMountedLogic, useValues } from 'kea'

import SubmitButton from 'lib/tags/submit-button'

import sceneLogic from 'scenes/login/logic'
import sceneSaga from 'scenes/login/saga'

export default function LoginScene () {
  useMountedLogic(sceneSaga)
  const { performLogin, setEmail, setPassword } = useActions(sceneLogic)
  const { email, password, errors, isSubmitting } = useValues(sceneLogic)

  function handleFormSubmit (e) {
    e.preventDefault()
    performLogin()
  }

  return (
    <div className='login-scene'>
      <form className='login-box' onSubmit={handleFormSubmit}>
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
