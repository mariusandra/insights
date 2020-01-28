import React from 'react'
import { useActions } from 'kea'
import { Button, Dropdown, Menu, Icon } from 'antd'

import client from 'lib/client'

import headerLogic from '../logic'

function handleLogout () {
  client.logout()
  window.location.href = '/login'
}

export default function User ({ email }) {
  const { openLocation } = useActions(headerLogic)

  const menu = (
    <Menu>
      <Menu.Item>
        <Icon type='user' />
        {email}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item onClick={() => openLocation('/users')}>
        <Icon type="usergroup-add" />
        Users
      </Menu.Item>
      <Menu.Item onClick={() => openLocation('/settings')}>
        <Icon type="setting" />
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item onClick={handleLogout}>
        <Icon type="logout" />
        Log out
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['click']} >
      <Button type='link' icon="user" style={{ color: '#e8f3fd' }} />
    </Dropdown>
  )
}
