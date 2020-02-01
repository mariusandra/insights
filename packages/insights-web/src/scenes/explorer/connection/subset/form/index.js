import React from 'react'
import { Button, Form, Input, Modal, List, Tree, Checkbox } from 'antd'
import { useActions, useValues } from 'kea'

import connectionsLogic from '../../logic'
import logic from './logic'

function SubsetForm ({ form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { isSubsetOpen } = useValues(connectionsLogic)
  const { structure } = useValues(logic)
  const { closeSubset } = useActions(connectionsLogic)
  const isSaving = false
  const handleAdd = () => {}

  return (
    <Modal
      destroyOnClose
      visible={isSubsetOpen}
      title='Edit Subset'
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
      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
        <Form.Item label='Name'>
          {getFieldDecorator('keyword', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: 'Please input a name!',
              }
            ]
          })(<Input placeholder='All Data' style={{width: '100%'}} />)}
        </Form.Item>
      </Form>

      <Tree>
        {Object.keys(structure).map(model => (
          <Tree.TreeNode key={model} title={<><Checkbox style={{ marginRight: 10 }} checked />{model}</>}>
            {Object.keys(structure[model].columns).map(column => (
              <Tree.TreeNode key={column} title={<><Checkbox style={{ marginRight: 10 }} checked />{column}</>} />
            ))}
          </Tree.TreeNode>
        ))}
      </Tree>

    </Modal>
  )
}

export default Form.create({ name: 'database' })(SubsetForm);
