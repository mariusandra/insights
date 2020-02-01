import React, { useEffect, useState } from 'react'
import { useActions, useValues } from 'kea'

import { Button, Form, Input, Modal, Icon, Tag } from "antd"

import connectionsLogic from '../../logic'

function DatabaseForm ({ form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { isAddOpen, isEditOpen, editingConnection, isSaving, didTest, isTesting, testPassed } = useValues(connectionsLogic)
  const { addConnection, editConnection, closeConnection, confirmRemoveConnection, testConnection } = useActions(connectionsLogic)

  const [wasEverOpen, setWasEverOpen] = useState(false)

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

  const runTest = () => {
    if (isEditOpen || isAddOpen) {
      setWasEverOpen(true)
      testConnection(getFieldValue('url'), getFieldValue('structurePath'))
    }
  }

  useEffect(runTest, [isEditOpen, isAddOpen])

  const initial = isEditOpen ? editingConnection : {}

  return (
    <Modal
      destroyOnClose
      visible={isAddOpen || isEditOpen}
      title={isAddOpen ? 'New Connection' : 'Edit Connection'}
      onCancel={closeConnection}
      canOutsideClickClose
      footer={[
        isEditOpen ? <Button key="delete" onClick={() => confirmRemoveConnection(editingConnection._id)} type='link' style={{ float: 'left' }}>
          <Icon type='delete' theme="filled" />
          Delete
        </Button> : null,
        <Button key="back" onClick={closeConnection}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={isSaving} onClick={handleAdd}>
          Save
        </Button>,
      ]}
    >
      {wasEverOpen ? <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
        <Form.Item
          label='Keyword'
          extra="This will be used in URLs, dashboards, etc to refer to your database. You can't change this later!">
          {getFieldDecorator('keyword', {
            initialValue: initial.keyword || '',
            rules: [
              {
                required: true,
                message: 'Please input a keyword!',
              },
              {
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Allowed characters: A-Z, a-z, 0-9, _ and -'
              }
            ]
          })(<Input disabled={isEditOpen} autoFocus={isAddOpen} placeholder='mydb' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='Connection'
          extra='Currently only URLs in the format "psql://user:pass@localhost/dbname" are supported.'>
          {getFieldDecorator('url', {
            initialValue: initial.url || '',
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
          })(<Input placeholder='psql://user:pass@localhost/dbname' style={{width: '100%'}} onBlur={runTest} />)}
        </Form.Item>

        <Form.Item
          label='insights.yml'
          extra='Leave empty to autodetect the database structure'>
          {getFieldDecorator('structurePath', {
            initialValue: initial.structurePath || ''
          })(<Input placeholder='/Users/yourname/projects/code/insights.yml' style={{width: '100%'}} onBlur={runTest} />)}
        </Form.Item>

        <Form.Item
          label='Timeout'
          extra='Statement timeout in milliseconds'>
          {getFieldDecorator('timeoutMs', {
            initialValue: initial.timeoutMs || '',
            rules: [
              {
                type: 'number',
                message: 'Please input a number',
                transform: value => Number(value)
              }
            ]
          })(<Input placeholder='15000' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item label='Test'>
          {!didTest
            ? <Tag>Enter URL to test</Tag>
            : isTesting
              ? <Tag color='blue'>Connecting...</Tag>
              : testPassed
                ? <Tag color='green'>Connection Established</Tag>
                : <Tag color='red'>Connection Failed</Tag>}

          {getFieldValue('url') ? <Button
            type='link'
            onClick={runTest}
            loading={isTesting}>{isTesting ? '' : testPassed ? 'Reconnect' : 'Retry'}</Button> : null}
        </Form.Item>
      </Form> : null}
    </Modal>
  )
}

export default Form.create({ name: 'database' })(DatabaseForm);
