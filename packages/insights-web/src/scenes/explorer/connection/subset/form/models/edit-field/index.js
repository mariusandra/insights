import React from 'react'
import { Button, Checkbox, Form, Icon, Input, Mentions, Modal, Select } from 'antd'
import { kea, useActions, useValues } from 'kea'

import modelsLogic from '../logic'

const columnTypes = ['string', 'number', 'boolean', 'time', 'date', 'unknown']

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
  custom: 'code'
}

const fieldExample = '${field}' // eslint-disable-line
const fieldExample2 = "${first_name} || ' ' || ${last_name}" // eslint-disable-line

const logic = kea({
  connect: {
    values: [modelsLogic, ['editingModel', 'editingField', 'editingFieldType', 'sortedStructure']]
  },

  selectors: ({ selectors }) => ({
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
    ],

    canClearEdits: [
      () => [selectors.editingFieldType, selectors.modelFields, selectors.fieldData],
      (editingFieldType, modelFields, fieldData) =>
        editingFieldType === 'edited' &&
        (fieldData.key === fieldData.originalKey || !modelFields.includes(fieldData.originalKey))
    ]
  })
})

function EditField ({ closeEdit, visible, form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { models, fieldData, modelFields, canClearEdits } = useValues(logic)
  const { editingModel, editingField, editingFieldType } = useValues(modelsLogic)
  const { saveNewField, saveEditedNewField, saveEditedOldField, deleteNewField, deleteEditedField } = useActions(modelsLogic)
  const type = getFieldValue('type') || (fieldData ? fieldData.type || 'custom' : 'custom')

  const handleSave = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        let meta = { type: values.metaType }

        if (values.type === 'custom') {
          meta.sql = values.metaSql
        }

        if (values.type === 'link') {
          meta.my_key = values.metaMyKey
          meta.model = values.metaModel
          meta.model_key = values.metaModelKey
        }

        if (values.type === 'column') {
          if (values.metaPrimaryKey) {
            meta.index = 'primary_key'
          }
        }

        if (editingField) {
          if (editingFieldType === 'new') {
            saveEditedNewField(editingModel, editingField, values.column, values.type, meta)
          } else { // 'old' or 'edited'
            saveEditedOldField(editingModel, fieldData.originalKey || fieldData.key, values.column, values.type, meta)
          }
        } else {
          saveNewField(editingModel, values.column, values.type, meta)
        }
      }
    })
  }

  return (
    <Modal
      visible={visible}
      destroyOnClose
      onCancel={closeEdit}
      keyboard={false}
      title={<>{editingModel} <Icon type="right" /> {editingField || 'New Field'}</>}
      footer={[
        editingFieldType === 'new' && editingField ? (
          <Button key="delete" type='link' style={{ float: 'left' }} onClick={() => deleteNewField(editingModel, editingField)}>
            <Icon type='delete' theme="filled" />
            Delete
          </Button>
        ) : null,
        editingFieldType === 'edited' ? (
          <Button
            disabled={!canClearEdits}
            key="delete"
            type='link'
            style={{ float: 'left' }}
            title={canClearEdits ? '' : `Can not rename field back to "${fieldData.originalKey}"`}
            onClick={() => deleteEditedField(editingModel, fieldData.originalKey, fieldData.key)}>
            <Icon type='delete' theme="filled" />
            Clear Edit
          </Button>
        ) : null,
        <Button key="back" onClick={closeEdit}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={false} onClick={handleSave}>
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
                  message: 'Please input a name for the field!',
                },
                (rule, value, callback) => {
                  if (modelFields.includes(value)) {
                    callback(`The field "${value}" is already in use on ${editingModel}!`)
                  } else {
                    callback()
                  }
                }
              ]
            })(<Input autoComplete='off' placeholder='column_name' style={{width: '100%'}} />)}
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

              <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
                {getFieldDecorator('metaPrimaryKey', {
                  initialValue: (fieldData.meta ? fieldData.meta.index : '') === 'primary_key',
                  valuePropName: 'checked'
                })(<Checkbox>Primary Key</Checkbox>)}
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
                  <Mentions rows="3" prefix='${' placeholder='' split='' style={{ fontFamily: 'monospace' }}>
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

export default Form.create({ name: 'databaseColumn' })(EditField)
