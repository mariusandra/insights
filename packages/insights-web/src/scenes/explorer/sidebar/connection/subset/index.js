import React from 'react'
import { Menu, Button, Dropdown, Icon } from 'antd'

function SubsetMenu () {
  return (
    <Menu >
      <Menu.Item >
        <Icon type="bars" />
        All Data
      </Menu.Item>
      <Menu.Item>
        <Icon type="edit" />
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
}

export default function Subset () {
  return (
    <Dropdown overlay={<SubsetMenu />} trigger={['click']}>
      <Button>
        <Icon type="bars" />
        All Data
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}
