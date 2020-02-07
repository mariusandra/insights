import React from 'react'
import { Menu, Button, Dropdown, Icon, Modal } from 'antd'

import SubsetForm from 'scenes/explorer/connection/subset/form'

import { useActions, useValues } from 'kea'

import connectionsLogic from 'scenes/explorer/connection/logic'

function openAddSubset () {
  Modal.info({
    title: 'NotImplementedException',
    content: (
      <div>
        <p>You're using an early release of Insights which doesn't yet support adding new subsets.</p>
        <p>For now, you can configure the "All Data" subset to have an idea of what this feature will let you do.</p>
        <p>Please consider sponsoring this project if you want to see custom subsets implemented quickly!</p>
        <p><a href='https://github.com/sponsors/mariusandra' target='_blank' rel="noopener noreferrer">https://github.com/sponsors/mariusandra</a></p>
      </div>
    ),
    onOk() {},
  });
}

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

      <Menu.Item onClick={openAddSubset}>
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
