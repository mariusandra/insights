import React from 'react'
import { useActions, useValues } from 'kea'

import { Menu, Icon } from 'antd'

import connectionsLogic from '../../logic'
import explorerLogic from '../../../../logic'

export default function DatabaseMenu ({ hide }) {
  const { selectedConnection, otherConnections } = useValues(connectionsLogic)

  const { openAddConnection, openEditConnection } = useActions(connectionsLogic)
  const { setConnection } = useActions(explorerLogic)

  return (
    <Menu
      mode="inline"
      selectable={false}
      defaultOpenKeys={['selected', 'other']}>
      {selectedConnection ? (
        <Menu.SubMenu
          key="selected"
          title={
            <span>
              <Icon type="database" theme="filled" />
              <span>{selectedConnection.keyword}</span>
            </span>
          }
        >
          <Menu.Item onClick={() => { openEditConnection(selectedConnection._id); hide() }}>
            <Icon type="edit" />
            Edit Connection
          </Menu.Item>
        </Menu.SubMenu>
      ) : null}

      {selectedConnection && otherConnections.length > 0 ? <Menu.Divider /> : null}

      {otherConnections.length > 0 ? (
        <Menu.SubMenu
          key="other"
          title={
            <span>
              <Icon type="database" />
              <span>Other Connections</span>
            </span>
          }
        >
          {otherConnections.map(connection => (
            <Menu.Item key={connection._id} onClick={() => { setConnection(connection.keyword); hide() }}>
              <Icon type="api" />
              {connection.keyword}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ) : null}

      {otherConnections.length > 0 ? <Menu.Divider /> : null}

      <Menu.Item onClick={() => { openAddConnection(); hide() } }>
        <Icon type="plus" />
        New Connection
      </Menu.Item>
    </Menu>
  )
}
