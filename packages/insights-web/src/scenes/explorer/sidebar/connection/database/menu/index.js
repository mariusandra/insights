import React from 'react'
import { useActions, useValues } from 'kea'

import { Menu, Icon } from 'antd'

import connectionsLogic from '../../logic'
import explorerLogic from '../../../../logic'

export default function DatabaseMenu () {
  const { selectedConnection, otherConnections } = useValues(connectionsLogic)

  const { openAddConnection, openEditConnection } = useActions(connectionsLogic)
  const { setConnection } = useActions(explorerLogic)

  return (
    <Menu>
      {selectedConnection ? (
        <Menu.Item>
          <Icon type="database" theme="filled" />
          {selectedConnection.keyword}
        </Menu.Item>
      ) : null}
      {selectedConnection ? (
        <Menu.Item onClick={() => openEditConnection(selectedConnection._id)}>
          <Icon type="edit" />
          Edit Connection
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

      <Menu.Item onClick={openAddConnection}>
        <Icon type="plus" />
        New Connection
      </Menu.Item>
    </Menu>
  )
}
