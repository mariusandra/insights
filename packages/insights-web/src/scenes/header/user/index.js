import React from 'react'
import { useActions } from 'kea'
import { Button, Dropdown, Menu, Icon, Modal } from 'antd'

import client from 'lib/client'

import headerLogic from '../logic'

function handleLogout () {
  client.logout()
  window.location.href = '/login'
}

function openSupport () {
  Modal.info({
    title: 'Support Insights',
    content: (
      <div>
        <p>If you like Insights or use it in your company, please consider sponsoring its development.</p>
        <p><a href='https://github.com/sponsors/mariusandra' target='_blank' rel="noopener noreferrer">https://github.com/sponsors/mariusandra</a></p>
      </div>
    ),
    onOk() {},
  });
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
      <Menu.Item onClick={openSupport}>
        <Icon type="smile" />
        Support Insights
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
