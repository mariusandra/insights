import React from 'react'
import { useActions, useValues } from 'kea'
import { Icon, Menu } from 'antd'
import connectionsLogic from 'scenes/explorer/connection/logic'

export default function SubsetMenu () {
  const { selectedSubset, otherSubsets, connectionId } = useValues(connectionsLogic)
  const { newSubset, editSubset, setConnectionId } = useActions(connectionsLogic)

  return (
    <Menu>
      {selectedSubset ? <Menu.ItemGroup className='connection-menu-header-title' title={
        <>
          <Icon type="bars" style={{ marginRight: 6 }} />
          <span>{selectedSubset ? selectedSubset.name : '...'}</span>
        </>
      }>
        <Menu.Item onClick={editSubset}>
          <Icon type="edit" style={{ marginLeft: 12 }} />
          Configure
        </Menu.Item>
      </Menu.ItemGroup> : null}

      {selectedSubset ? <Menu.Divider /> : null}

      {otherSubsets.map(subset => (
        <Menu.Item key={subset._id} onClick={() => setConnectionId(connectionId, subset._id)}>
          <Icon type="bars" />
          {subset.name}
        </Menu.Item>
      ))}

      {otherSubsets.length > 0 ? <Menu.Divider /> : null}

      <Menu.Item onClick={newSubset}>
        <Icon type="plus" />
        New Subset
      </Menu.Item>
    </Menu>
  )
}
