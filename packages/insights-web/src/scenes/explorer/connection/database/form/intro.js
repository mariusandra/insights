import React from 'react'
import { Alert, Divider } from 'antd'

export default function Intro () {
  return (
    <>
      <Alert
        message='Welcome to Insights!'
        description='Please set up your first connection to get started!'
        type="info"
        showIcon
      />
      <Divider />
    </>
  )
}
