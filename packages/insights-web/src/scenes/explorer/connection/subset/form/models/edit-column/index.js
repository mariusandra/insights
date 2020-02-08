import React from 'react'
import { Button, Form, Icon, Input, Mentions, Modal, Select } from 'antd'
import { kea, useValues } from 'kea'

import modelsLogic from '../logic'

const columnTypes = ['string', 'boolean', 'time', 'date', 'number', 'unknown']

export const columnIcon = {
  number: 'number',
  time: 'clock-circle',
  date: 'calendar',
  string: 'font-size',
  boolean: 'tag',
  unknown: 'question-circle'
}

export const fieldIcon = {
  column: 'tag',
  link: 'link',
  custom: 'form'
}

const fieldExample = '${field}' // eslint-disable-line
const fieldExample2 = "${first_name} || ' ' || ${last_name}" // eslint-disable-line

const logic = kea({
  connect: {
    values: [modelsLogic, ['editingColumn', 'sortedStructure']]
  },

  selectors: ({ selectors }) => ({
    editingModel: [
      () => [selectors.editingColumn],
      (editingColumn) => editingColumn ? editingColumn.split('.', 2)[0] : ''
    ],

    editingField: [
      () => [selectors.editingColumn],
      (editingColumn) => editingColumn ? editingColumn.split('.', 2)[1] : ''
    ],

    models: [
      () => [selectors.sortedStructure],
      (sortedStructure) => Object.keys(sortedStructure),
    ],

    fieldData: [
      () => [selectors.sortedStructure, selectors.editingModel, selectors.editingField],
      (sortedStructure, model, field) => sortedStructure[model] ? sortedStructure[model].find(k => k.key === field) || {} : {}
    ],

    modelFields: [
      () => [selectors.sortedStructure, selectors.editingModel, selectors.editingField],
      (sortedStructure, model, field) => sortedStructure[model] ? sortedStructure[model].map(s => s.key).filter(k => k !== field) : []
    ]
  })
})

function EditColumn ({ closeEdit, visible, form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { models, editingModel, editingField, fieldData, modelFields } = useValues(logic)
  const type = getFieldValue('type') || (fieldData ? fieldData.type || 'custom' : 'custom')

  return (
    <Modal
      visible={visible}
      destroyOnClose
      onCancel={closeEdit}
      keyboard={false}
      title={<>{editingModel} <Icon type="right" /> {editingField || 'New Field'}</>}
      footer={[
        <Button key="delete" type='link' style={{ float: 'left' }}>
          <Icon type='delete' theme="filled" />
          Delete
        </Button>,
        <Button key="back" onClick={closeEdit}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={false} onClick={closeEdit}>
          Save
        </Button>,
      ]}>

      {visible ? (
        <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={closeEdit}>
          <Form.Item label='Field name'>
            {getFieldDecorator('column', {
              initialValue: editingField,
              rules: [
                {
                  required: true,
                  message: 'Please input a name!',
                }
              ]
            })(<Input placeholder='column_name' style={{width: '100%'}} />)}
          </Form.Item>

          <Form.Item label='Field type'>
            {getFieldDecorator('type', {
              initialValue: type,
              rules: [
                {
                  required: true,
                  message: 'Please select field type',
                }
              ]
            })(
              <Select style={{width: '100%'}}>
                <Select.Option value='column'><Icon type={fieldIcon.column} /> Database column (with the same name)</Select.Option>
                <Select.Option value='custom'><Icon type={fieldIcon.custom} /> Custom SQL</Select.Option>
                <Select.Option value='link'><Icon type={fieldIcon.link} /> Link to another model</Select.Option>
              </Select>
            )}
          </Form.Item>

          {type === 'column' ? (
            <>
              <Form.Item label='Column type'>
                {getFieldDecorator('metaType', {
                  initialValue: fieldData.meta ? fieldData.meta.type : '',
                  rules: [
                    {
                      required: true,
                      message: 'Please select column data type',
                    }
                  ]
                })(
                  <Select style={{width: '100%'}}>
                    {columnTypes.map(type => <Select.Option key={type} value={type}><Icon type={columnIcon[type] || 'unknown-circle'} /> {type}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>
            </>
          ) : null}

          {type === 'link' ? (
            <>
              <Form.Item label='My key' extra={<span>Column on database table for <strong>{editingModel}</strong></span>}>
                {getFieldDecorator('metaMyKey', {
                  initialValue: (fieldData.meta ? fieldData.meta.my_key : '') || editingField,
                  rules: [
                    {
                      required: true,
                      message: 'Please enter a key on this model',
                    }
                  ]
                })(
                  <Input placeholder='user_id' style={{width: '100%'}} />
                )}
              </Form.Item>

              <Form.Item label='Model' extra='Model to link to'>
                {getFieldDecorator('metaModel', {
                  initialValue: fieldData.meta ? fieldData.meta.model : '',
                  rules: [
                    {
                      required: true,
                      message: 'Please select a model',
                    }
                  ]
                })(
                  <Select style={{width: '100%'}}>
                    {models.map(type => <Select.Option key={type} value={type}>{type}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>

              <Form.Item label='Model key' extra={getFieldValue('metaModel') ? (
                <span>Column on database table for <strong>{getFieldValue('metaModel')}</strong></span>
              ) : 'Field on linked model'}>
                {getFieldDecorator('metaModelKey', {
                  initialValue: fieldData.meta ? fieldData.meta.model_key : '',
                  rules: [
                    {
                      required: true,
                      message: 'Please enter a key on the linked model',
                    }
                  ]
                })(
                  <Input placeholder='id' style={{width: '100%'}} />
                )}
              </Form.Item>
            </>
          ) : null}

          {type === 'custom' ? (
            <>
              <Form.Item
                label='SQL'
                extra={
                  <>
                    <p>
                      Enter the raw SQL that will be used as this field
                    </p>
                    <p>
                      Use the notation <code>{fieldExample}</code> to refer to other fields in this model. For example:
                    </p>
                    <p>
                      <code>{fieldExample2}</code>
                    </p>
                    <p>
                      These other fields do not need to be part of the subset.
                    </p>
                  </>
                }>
                {getFieldDecorator('metaSql', {
                  initialValue: fieldData.meta ? fieldData.meta.sql : '',
                  rules: [
                    {
                      required: true,
                      message: 'Please input the custom SQL!',
                    }
                  ]
                })(
                  <Mentions rows="3" prefix='${' placeholder='' split=''>
                    {modelFields.map(f => <Mentions.Option key={f} value={f}>{f}</Mentions.Option>)}
                  </Mentions>
                )}
              </Form.Item>

              <Form.Item label='Return type'>
                {getFieldDecorator('metaType', {
                  initialValue: fieldData.meta ? fieldData.meta.type : '',
                  rules: [
                    {
                      required: true,
                      message: 'Please select custom SQL return type',
                    }
                  ]
                })(
                  <Select style={{width: '100%'}}>
                    {columnTypes.map(type => <Select.Option key={type} value={type}><Icon type={columnIcon[type] || 'unknown-circle'} /> {type}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>
            </>
          ) : null}
        </Form>
      ) : null}
    </Modal>
  )
}

export default Form.create({ name: 'databaseColumn' })(EditColumn)
