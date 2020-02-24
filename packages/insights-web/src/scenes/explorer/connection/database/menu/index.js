import React from 'react'
import { useActions, useValues } from 'kea'
import { Icon, Menu } from 'antd'

import connectionsLogic from '../../logic'
import explorerLogic from '../../../logic'

export default function ConnectionMenu () {
  const { selectedConnection, otherConnections } = useValues(connectionsLogic)

  const { openAddConnection, openEditConnection } = useActions(connectionsLogic)
  const { setConnectionId } = useActions(explorerLogic)

  return (
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
            Configure
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
}
