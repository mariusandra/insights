import './styles.scss'

import React, { useState } from 'react'
import { Form, Button, Card, Radio, Input, Icon, Tooltip } from 'antd'

import client from '../../lib/client'

export default function LoginScene () {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authStrategy, setAuthStrategy] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const formValid = authStrategy === 'noLogin' || (email && password)
  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  async function handleFormSubmit (e) {
    e.preventDefault()
    setIsSubmitting(true)

    const setupService = client.service('setup')

    const response = await setupService.create({
      authStrategy, email, password
    })

    console.log(response)
  }

  return (
    <div className='setup-scene'>
      <div className='background' />
      <Card>
        <div className='logo'>
          <img src='/logo64.png' alt='' />
          Insights
        </div>

        <p>
          How will you log in to Insights?
        </p>

        <Form {...formItemLayout} onSubmit={handleFormSubmit} className='setup-box'>
          <Radio.Group {...formItemLayout} onChange={e => setAuthStrategy(e.target.value)} value={authStrategy}>
            <Radio style={radioStyle} value='noLogin'>
              No Authentication
              <Tooltip title="Anyone who opens the URL can see all your data. Only use this if you really know what you're doing!">
                <Icon type='question-circle' style={{ marginLeft: 10 }} />
              </Tooltip>
            </Radio>
            <Radio style={radioStyle} value='local'>
              Username & Password
            </Radio>
          </Radio.Group>
          <br />
          <br />

          {authStrategy === 'local' ? (
            <>
              <p>Great choice! Please set up the admin account that you will use to log in</p>
              <Form.Item label="Admin E-mail">
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="you@company.com"
                  autoFocus
                  value={email}
                  type='email'
                  onChange={e => setEmail(e.target.value)}
                />
              </Form.Item>

              <Form.Item label="Admin Password">
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="correct horse battery staple"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </Form.Item>
            </>
          ) : null}

          <Button type="primary" htmlType="submit" className="setup-form-button" loading={isSubmitting} disabled={!formValid}>
            Finish Setup
          </Button>
        </Form>
      </Card>
    </div>
  )
}
