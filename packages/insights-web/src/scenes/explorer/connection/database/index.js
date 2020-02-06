import React from 'react'
import { useActions, useValues } from 'kea'
import { Button, Icon, Dropdown, Menu } from "antd"

import DatabaseForm from './form'

import connectionsLogic from '../logic'
import explorerLogic from '../../logic'

export default function Database () {
  const { selectedConnection, otherConnections, isLoading } = useValues(connectionsLogic)

  const { openAddConnection, openEditConnection } = useActions(connectionsLogic)
  const { setConnectionId } = useActions(explorerLogic)

  const menu = (
    <Menu>
      {selectedConnection ? (
        <Menu.ItemGroup className='connection-menu-header-title' title={
          <>
            <Icon type="database" theme="filled" style={{ marginRight: 6 }} />
            <span>{selectedConnection.name}</span>
          </>
        }>
          <Menu.Item onClick={() => openEditConnection(selectedConnection._id)}>
            <Icon type="edit" style={{ marginLeft: 12 }} />
            Edit
          </Menu.Item>
        </Menu.ItemGroup>
      ) : null}

      {selectedConnection ? <Menu.Divider /> : null}

      {otherConnections.map(connection => (
        <Menu.Item key={connection._id} onClick={() => setConnectionId(connection._id)}>
          <Icon type="database" />
          {connection.name}
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
          <span className='button-text'>{isLoading ? '...' : (selectedConnection ? selectedConnection.name : 'Select Connection')}</span>
          <Icon type="down" className='arrow' />
        </Button>
      </Dropdown>
      <DatabaseForm />
    </>
  )
}
