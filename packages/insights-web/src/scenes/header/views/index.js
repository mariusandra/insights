import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { useSelector } from 'react-redux'
import { Dropdown, Button, Menu, Icon, Modal, Form, Input } from 'antd'

import viewsLogic from 'scenes/header/views/logic'
import locationSelector from 'lib/selectors/location'

function Views () {
  const { newName, sortedViews, newOpen } = useValues(viewsLogic)
  const { setNewName, openNew, cancelNew, openView, saveView } = useActions(viewsLogic)
  const { pathname } = useSelector(locationSelector)

  const overlay = (
    <Menu>
      {pathname.includes('/explorer')
        ? <Menu.Item onClick={openNew}>
            <Icon type='plus' />
            Save this view
          </Menu.Item>
        : <Menu.Item icon='plus' disabled onClick={openNew}>
            <Icon type='plus' />
            Open the explorer to save views
          </Menu.Item>
      }

      {sortedViews.length > 0 ? <Menu.Divider /> : null}

      {sortedViews.map(view => (
        <Menu.Item
          key={view._id}
          style={{maxWidth: 300}}
          icon='th-derived'
          onClick={() => openView(view._id)}>{view.name}</Menu.Item>
      ))}
    </Menu>
  )

  return (
    <>
      <Dropdown overlay={overlay} trigger={['click']} >
        <Button type="link" icon="star" style={{ color: '#e8f3fd' }} />
      </Dropdown>

      {newOpen ? (
        <Modal
          icon='info-sign'
          onOk={saveView}
          onCancel={cancelNew}
          title='Save the current view'
          visible
        >
          <Form onSubmit={e => { e.preventDefault(); saveView() }}>
            <Form.Item>
              <Input placeholder='Enter a title' value={newName} onChange={e => setNewName(e.target.value)} style={{width: '100%'}} autoFocus />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}
    </>
  )
}

export default Views
