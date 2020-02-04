import React from 'react'
import { useActions, useValues } from 'kea'
import { Button, Icon, Dropdown, Menu } from "antd"

import DatabaseForm from './form'

import connectionsLogic from '../logic'
import explorerLogic from '../../logic'

export default function Database () {
  const { selectedConnection, otherConnections, isLoading } = useValues(connectionsLogic)

  const { openAddConnection, openEditConnection } = useActions(connectionsLogic)
  const { setConnection } = useActions(explorerLogic)

  const menu = (
    <Menu>
      {selectedConnection ? (
        <Menu.Item>
          <Icon type="database" theme="filled" />
          <span>{selectedConnection.keyword}</span>
        </Menu.Item>
      ) : null}
      {selectedConnection ? (
        <Menu.Item onClick={() => openEditConnection(selectedConnection._id)}>
          <Icon type="edit" style={{ marginLeft: 16 }} />
          Edit
        </Menu.Item>
      ) : null}

      {selectedConnection ? <Menu.Divider /> : null}

      {otherConnections.map(connection => (
        <Menu.Item key={connection._id} onClick={() => setConnection(connection.keyword)}>
          <Icon type="database" />
          {connection.keyword}
        </Menu.Item>
      ))}

      {otherConnections.length > 0 ? <Menu.Divider /> : null}

      <Menu.Item onClick={() => openAddConnection(false)}>
        <Icon type="plus" />
        New Connection
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button>
          <Icon type="database" theme="filled" />
          <span className='button-text'>{isLoading ? '...' : (selectedConnection ? selectedConnection.keyword : 'Select Connection')}</span>
          <Icon type="down" className='arrow' />
        </Button>
      </Dropdown>
      <DatabaseForm />
    </>
  )
}
