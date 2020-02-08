import React from 'react'
import { Button, Divider, Form, Modal, Alert, Input, Checkbox, Icon } from 'antd'
import { useActions, useValues } from 'kea'

import connectionsLogic from '../../logic'
import logic from './logic'

import Models from './models'

function SubsetForm ({ form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { isSubsetOpen, subset } = useValues(connectionsLogic)
  const { closeSubset } = useActions(connectionsLogic)
  const { isSaving } = useValues(logic)
  const { saveSubset, confirmRemoveSubset } = useActions(logic)

  const handleAdd = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, addNewModels, addNewFields } = values
        saveSubset({ name, addNewModels, addNewFields })
      }
    })
  }

  return (
    <Modal
      destroyOnClose
      visible={isSubsetOpen}
      title={subset ? (subset._id ? `Configure "${subset.name}"` : 'New Subset') : 'Loading Subset...'}
      onCancel={closeSubset}
      keyboard={false}
      canOutsideClickClose
      width='85%'
      footer={[
        subset && subset._id && subset.type === 'custom' ? <Button key="delete" onClick={() => confirmRemoveSubset(subset._id)} type='link' style={{ float: 'left' }}>
          <Icon type='delete' theme="filled" />
          Delete
        </Button> : null,
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
              })(<Input placeholder='Marketing Subset' disabled={subset.type === 'all_data'} style={{width: '100%'}} />)}
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
              {getFieldDecorator('addNewModels', {
                initialValue: subset.addNewModels,
                valuePropName: 'checked'
              })(<Checkbox>Automatically add new models when they are added to the database</Checkbox>)}
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
              {getFieldDecorator('addNewFields', {
                initialValue: subset.addNewFields,
                valuePropName: 'checked'
              })(<Checkbox>Automatically add new fields in selected models</Checkbox>)}
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
