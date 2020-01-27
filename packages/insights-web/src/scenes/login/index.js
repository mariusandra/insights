import './styles.scss'

import React from 'react'
import { useActions, useMountedLogic, useValues } from 'kea'
import { Form, Input, Icon, Button, Card } from 'antd'

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
      <Card style={{ width: 300 }}>
        <div className='logo'>
          <img src='/logo64.png' alt='' />
          Insights
        </div>

        <Form onSubmit={handleFormSubmit} className='login-box'>
          <Form.Item
            validateStatus={errors.email ? 'error' : ''}
            extra={errors.email}>
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="E-mail"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            validateStatus={errors.password ? 'error' : ''}
            extra={errors.password}>
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" className="login-form-button" loading={isSubmitting}>
            Log in
          </Button>
          {/*<div className='field'>*/}
          {/*  <label />*/}
          {/*  <a href='http://localhost:3030/oauth/google'>Login with Google</a>*/}
          {/*</div>*/}
        </Form>
      </Card>
    </div>
  )
}
