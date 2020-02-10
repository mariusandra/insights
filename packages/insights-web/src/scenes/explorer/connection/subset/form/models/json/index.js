import React from 'react'
import { Button, Form, Input, Modal } from 'antd'
import { useActions, useValues } from 'kea'

import modelsLogic from '../logic'

function JSONComponent ({ visible, form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { defaultJSON } = useValues(modelsLogic)
  const { hideJSON, setNewFields, setEditedFields, setCheckedKeys } = useActions(modelsLogic)

  const handleSave = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { newFields, editedFields, checkedKeys } = JSON.parse(values.json)
        setNewFields(newFields || {})
        setEditedFields(editedFields || {})
        setCheckedKeys(checkedKeys || [])
        hideJSON()
      }
    })
  }

  return (
    <Modal
      visible={visible}
      destroyOnClose
      onCancel={hideJSON}
      width='75%'
      keyboard={false}
      title='subset-changes.json'
      footer={[
        <Button key="back" onClick={hideJSON}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={false} onClick={handleSave}>
          Save
        </Button>,
      ]}>

      {visible ? (
        <Form onSubmit={handleSave}>
          <Form.Item>
            {getFieldDecorator('json', {
              initialValue: defaultJSON,
              rules: [
                {
                  required: true,
                  message: 'Please input the JSON!',
                },
                (rule, value, callback) => {
                  try {
                    JSON.parse(value)
                    callback()
                  } catch (e) {
                    callback('This is not valid JSON!')
                  }
                }
              ]
            })(<Input.TextArea autoSize={{ minRows: 2, maxRows: 20 }} placeholder='{}' style={{width: '100%', fontFamily: 'monospace'}} />)}
          </Form.Item>
        </Form>
      ) : null}
    </Modal>
  )
}

export default Form.create({ name: 'modelsJSON' })(JSONComponent)
