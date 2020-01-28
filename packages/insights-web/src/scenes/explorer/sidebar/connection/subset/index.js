import React from 'react'
import { Menu, Button, Dropdown, Icon } from 'antd'

export default function Subset () {
  const menu = (
    <Menu>
      <Menu.Item >
        <Icon type="bars" />
        All Data
      </Menu.Item>
      <Menu.Item>
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
    <Dropdown overlay={menu} trigger={['click']}>
      <Button>
        <Icon type="bars" />
        All Data
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}
