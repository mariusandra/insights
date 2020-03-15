import './styles.scss'

import React from 'react'
import { Form, Button, Card } from 'antd'

export default function LoginScene () {
  function handleFormSubmit (e) {
    e.preventDefault()
  }

  const isSubmitting = false

  return (
    <div className='setup-scene'>
      <div className='background' />
      <Card style={{ width: 300 }}>
        <div className='logo'>
          <img src='/logo64.png' alt='' />
          Insights
        </div>

        <Form onSubmit={handleFormSubmit} className='setup-box' style={{ textAlign: 'center' }}>
          Please Run
          <br /><br />
          <code>insights init</code>
          <br /><br />
          to set up the application!
          <br /><br />

          <Button type="primary" htmlType="submit" className="setup-form-button" loading={isSubmitting}>
            I will do it!
          </Button>
        </Form>
      </Card>
    </div>
  )
}
