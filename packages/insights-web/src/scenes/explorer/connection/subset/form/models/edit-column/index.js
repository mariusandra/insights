import React from 'react'
import { Modal } from 'antd'

function EditColumn ({ column, closeEdit, visible }) {
  return (
    <Modal visible={visible} destroyOnClose onCancel={closeEdit} title={column}>
      Editing Column!

    </Modal>
  )
}

export default EditColumn
