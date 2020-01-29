import React from 'react'
import { useActions, useValues } from 'kea'

import { message, Form, Input, Modal } from "antd"

import connectionsLogic from '../../logic'

function DatabaseForm ({ form: { getFieldDecorator, validateFieldsAndScroll } }) {
  const { isAddOpen } = useValues(connectionsLogic)
  const { addConnection, closeAddConnection } = useActions(connectionsLogic)

  const handleAdd = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { keyword, url, structurePath, timeoutMs } = values
        addConnection({ keyword, url, structurePath, timeoutMs })
        message.success(`Database "${keyword}" added!`);
      }
    })
  }

  return (
    <Modal visible={isAddOpen} title='New Connection' onOk={handleAdd} onCancel={closeAddConnection} canOutsideClickClose>
      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
        <Form.Item
          label='Keyword'
          extra='This will be used in URLs, dashboards, etc to refer to your database. Changing it later might result in problems...'>
          {getFieldDecorator('keyword', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: 'Please input a keyword!',
              }
            ]
          })(<Input autoFocus placeholder='mydb' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='Connection'
          extra='Currently only URLs in the format "psql://user:pass@localhost/dbname" are supported.'>
          {getFieldDecorator('url', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: 'Please input a connection string!',
              },
              {
                pattern: /^psql:\/\//,
                message: 'Must be in the format "psql://user:pass@localhost/dbname"'
              }
            ]
          })(<Input autoFocus placeholder='psql://user:pass@localhost/dbname' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='Timeout'
          extra='Statement timeout in milliseconds'>
          {getFieldDecorator('timeoutMs', {
            initialValue: '',
            rules: [
              {
                type: 'number',
                message: 'Please input a number',
                transform: value => Number(value)
              }
            ]
          })(<Input autoFocus placeholder='15000' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='insights.yml'
          extra='Leave empty to autodetect the database structure'>
          {getFieldDecorator('structurePath', {
            initialValue: ''
          })(<Input autoFocus placeholder='/Users/yourname/projects/code/insights.yml' style={{width: '100%'}} />)}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Form.create({ name: 'database' })(DatabaseForm);
