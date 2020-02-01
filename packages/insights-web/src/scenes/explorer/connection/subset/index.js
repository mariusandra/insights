import React from 'react'
import { Menu, Button, Dropdown, Icon } from 'antd'

import SubsetForm from 'scenes/explorer/connection/subset/form'

import { useActions } from 'kea'

import connectionsLogic from 'scenes/explorer/connection/logic'

export default function Subset () {
  const { openSubset } = useActions(connectionsLogic)

  const menu = (
    <Menu>
      <Menu.Item >
        <Icon type="bars" />
        All Data
      </Menu.Item>
      <Menu.Item>
        <Icon type="branches" style={{ marginLeft: 16 }} />
        Show Structure
      </Menu.Item>
      <Menu.Item onClick={openSubset}>
        <Icon type="edit" style={{ marginLeft: 16 }} />
        Configure
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <Icon type="bars" />
        Accounting Subset
      </Menu.Item>
      <Menu.Item>
        <Icon type="bars" />
        Marketing Subset
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <Icon type="plus" />
        Create Subset
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button>
          <Icon type="bars" />
          All Data
          <Icon type="down" className='arrow' />
        </Button>
      </Dropdown>
      <SubsetForm />
    </>
  )
}
