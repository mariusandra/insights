import React from 'react'
import { Menu, Button, Dropdown, Icon } from 'antd'

import SubsetForm from 'scenes/explorer/connection/subset/form'

import { useActions, useValues } from 'kea'

import connectionsLogic from 'scenes/explorer/connection/logic'

export default function Subset () {
  const { isLoadingSubsets, selectedSubset, otherSubsets } = useValues(connectionsLogic)
  const { openSubset, setSubsetId } = useActions(connectionsLogic)

  const menu = (
    <Menu>
      {selectedSubset ? <Menu.ItemGroup className='connection-menu-header-title' title={
        <>
          <Icon type="bars" style={{ marginRight: 6 }} />
          <span>{selectedSubset ? selectedSubset.name : '...'}</span>
        </>
      }>
        <Menu.Item onClick={openSubset}>
          <Icon type="edit" style={{ marginLeft: 12 }} />
          Configure
        </Menu.Item>
      </Menu.ItemGroup> : null}

      {selectedSubset ? <Menu.Divider /> : null}

      {otherSubsets.map(subset => (
        <Menu.Item key={subset._id} onClick={() => setSubsetId(subset._id)}>
          <Icon type="bars" />
          {subset.name}
        </Menu.Item>
      ))}

      {otherSubsets.length > 0 ? <Menu.Divider /> : null}

      <Menu.Item onClick={openSubset}>
        <Icon type="plus" />
        New Subset
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button>
          <Icon type="bars" />
          {isLoadingSubsets ? '...' : 'All Data'}
          <Icon type="down" className='arrow' />
        </Button>
      </Dropdown>
      <SubsetForm />
    </>
  )
}
