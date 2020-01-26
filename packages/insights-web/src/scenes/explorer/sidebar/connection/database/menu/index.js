import React from 'react'
import { useActions, useValues } from 'kea'

import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core'

import connectionsLogic from '../../logic'
import explorerLogic from '../../../../logic'

export default function DatabaseMenu () {
  const { selectedConnection, otherConnections } = useValues(connectionsLogic)

  const { openAddConnection, openEditConnection } = useActions(connectionsLogic)
  const { setConnection } = useActions(explorerLogic)

  return (
    <Menu >
      {selectedConnection ? <>
        <li className="bp3-menu-header"><h6 className="bp3-heading">{selectedConnection.keyword}</h6></li>
        <MenuItem text="Configure" icon="wrench" onClick={() => openEditConnection(selectedConnection._id)} />
        <MenuDivider />
      </> : null}
      {otherConnections.length > 0 ? <>
        {otherConnections.map(connection => <MenuItem key={connection._id} text={connection.keyword} icon="database" onClick={() => setConnection(connection.keyword)} />)}
        <MenuDivider />
      </> : null}
      <MenuItem text="New Connection" icon="plus" onClick={openAddConnection} />
    </Menu>
  )
}
