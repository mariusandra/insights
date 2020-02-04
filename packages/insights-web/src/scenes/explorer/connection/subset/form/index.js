import React from 'react'
import { Button, Divider, Form, Modal, Alert, Input, Select } from 'antd'
import { useActions, useValues } from 'kea'

import connectionsLogic from '../../logic'
import logic from './logic'

import Models from './models'

function SubsetForm ({ form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { isSubsetOpen } = useValues(connectionsLogic)
  const { closeSubset } = useActions(connectionsLogic)
  const { isSaving } = useValues(logic)
  const { saveSubset } = useActions(logic)

  const handleAdd = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, new_models, new_fields } = values
        saveSubset({ name, new_models, new_fields })
      }
    })
  }

  return (
    <Modal
      destroyOnClose
      visible={isSubsetOpen}
      title='Configure "All Data"'
      onCancel={closeSubset}
      canOutsideClickClose
      width='85%'
      footer={[
        <Button key="back" onClick={closeSubset}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={isSaving} onClick={handleAdd}>
          Save
        </Button>,
      ]}
    >
      <Alert
        message='What is the "All Data" Subset?'
        description={
          <span>
            Insights uses "Subsets" to limit what can be seen in the explorer. Think of them as a partial views of your database.
            Each subset can be shared with different teams in your organisation.
            The "All Data" subset is what other subsets are based on. Changes here will be mirrored to all other subsets.
          </span>
        }
        type="info"
        showIcon
      />
      <Divider />

      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
        <Form.Item label='Name'>
          {getFieldDecorator('name', {
            initialValue: 'All Data',
            rules: [
              {
                required: true,
                message: 'Please input a name!',
              }
            ]
          })(<Input placeholder='All Data' disabled style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item label='New Models' extra='What to do with models that are added in the future'>
          {getFieldDecorator('new_models', {
            initialValue: 'add'
          })(
            <Select style={{width: '100%'}}>
              <Select.Option value="add">Add automatically</Select.Option>
              <Select.Option value="skip">Never add automatically</Select.Option>
            </Select>)}
        </Form.Item>

        <Form.Item label='New Fields' extra='What to do with new fields in included models'>
          {getFieldDecorator('new_fields', {
            initialValue: 'add'
          })(
            <Select style={{width: '100%'}}>
              <Select.Option value="add">Add automatically</Select.Option>
              <Select.Option value="skip">Never add automatically</Select.Option>
            </Select>)}
        </Form.Item>
      </Form>

      <Divider />

      <Models />

    </Modal>
  )
}

export default Form.create({ name: 'database' })(SubsetForm);
