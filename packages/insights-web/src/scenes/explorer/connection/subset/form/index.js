import React from 'react'
import { Button, Divider, Form, Modal, Alert, Input, Select } from 'antd'
import { useActions, useValues } from 'kea'

import connectionsLogic from '../../logic'
import logic from './logic'

import Models from './models'

function SubsetForm ({ form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { isSubsetOpen, subset } = useValues(connectionsLogic)
  const { closeSubset } = useActions(connectionsLogic)
  const { isSaving } = useValues(logic)
  const { saveSubset } = useActions(logic)

  const handleAdd = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, newModels, newFields } = values
        saveSubset({ name, newModels, newFields })
      }
    })
  }

  return (
    <Modal
      destroyOnClose
      visible={isSubsetOpen}
      title={subset ? `Configure "${subset.name}"` : 'Loading Subset...'}
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
      {!subset ? (
        <div>
          Loading...
        </div>
      ) : (
        <>
          {subset.type === 'all_data' ? (
            <>
              <Alert
                message='What is the "All Data" Subset?'
                description={
                  <span>
                    Insights uses "Subsets" to limit what can be seen in the explorer. Think of them as a partial views of your database.
                    Each subset can be shared with different teams in your organisation. For example you might want to hide accounting
                    tables from the marketing department who shouldn't have access to sensitive data.
                    The "All Data" subset is what other subsets are based on. Changes here will be mirrored to all other subsets.
                  </span>
                }
                type="info"
                showIcon
              />
              <Divider />
            </>
          ) : null}

          <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
            <Form.Item label='Name'>
              {getFieldDecorator('name', {
                initialValue: subset.name,
                rules: [
                  {
                    required: true,
                    message: 'Please input a name!',
                  }
                ]
              })(<Input placeholder='All Data' disabled style={{width: '100%'}} />)}
            </Form.Item>

            <Form.Item label='New Models' extra='What to do with models that are added in the future'>
              {getFieldDecorator('newModels', {
                initialValue: subset.newModels
              })(
                <Select style={{width: '100%'}}>
                  <Select.Option value="add">Add automatically</Select.Option>
                  <Select.Option value="skip">Never add automatically</Select.Option>
                </Select>)}
            </Form.Item>

            <Form.Item label='New Fields' extra='What to do with new fields in included models'>
              {getFieldDecorator('newFields', {
                initialValue: subset.newFields
              })(
                <Select style={{width: '100%'}}>
                  <Select.Option value="add">Add automatically</Select.Option>
                  <Select.Option value="skip">Never add automatically</Select.Option>
                </Select>)}
            </Form.Item>
          </Form>

          <Divider />

          <Models />
        </>
      )}
    </Modal>
  )
}

export default Form.create({ name: 'database' })(SubsetForm);
