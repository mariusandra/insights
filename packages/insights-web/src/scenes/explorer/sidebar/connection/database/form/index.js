import React from 'react'
import { useActions, useValues } from 'kea'

import { message, Form, Input, Modal } from "antd"

import connectionsLogic from '../../logic'

function DatabaseForm ({ form: { getFieldDecorator, validateFieldsAndScroll } }) {
  const { isAddOpen, isEditOpen, editingConnection, isSaving } = useValues(connectionsLogic)
  const { addConnection, editConnection, closeConnection } = useActions(connectionsLogic)

  const handleAdd = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { keyword, url, structurePath, timeoutMs } = values

        if (isEditOpen) {
          editConnection(editingConnection._id, url, structurePath, timeoutMs)
        } else {
          addConnection({keyword, url, structurePath, timeoutMs})
        }
      }
    })
  }

  const inital = isEditOpen ? editingConnection : {}

  return (
    <Modal destroyOnClose visible={isAddOpen || isEditOpen} title='New Connection' confirmLoading={isSaving} onOk={handleAdd} onCancel={closeConnection} canOutsideClickClose>
      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
        <Form.Item
          label='Keyword'
          extra="This will be used in URLs, dashboards, etc to refer to your database. You can't change this later!">
          {getFieldDecorator('keyword', {
            initialValue: inital.keyword || '',
            rules: [
              {
                required: true,
                message: 'Please input a keyword!',
              }
            ]
          })(<Input disabled autoFocus={isAddOpen} placeholder='mydb' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='Connection'
          extra='Currently only URLs in the format "psql://user:pass@localhost/dbname" are supported.'>
          {getFieldDecorator('url', {
            initialValue: inital.url || '',
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
          })(<Input placeholder='psql://user:pass@localhost/dbname' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='Timeout'
          extra='Statement timeout in milliseconds'>
          {getFieldDecorator('timeoutMs', {
            initialValue: inital.timeoutMs || '',
            rules: [
              {
                type: 'number',
                message: 'Please input a number',
                transform: value => Number(value)
              }
            ]
          })(<Input placeholder='15000' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='insights.yml'
          extra='Leave empty to autodetect the database structure'>
          {getFieldDecorator('structurePath', {
            initialValue: inital.structurePath || ''
          })(<Input placeholder='/Users/yourname/projects/code/insights.yml' style={{width: '100%'}} />)}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Form.create({ name: 'database' })(DatabaseForm);
