import React from 'react'
import { useActions } from 'kea'
import { Button, Popover, Position, Menu, MenuItem, MenuDivider } from "@blueprintjs/core"

import client from 'lib/client'

import headerLogic from '../logic'

export default function User ({ email }) {
  function handleLogout (e) {
    e.preventDefault()
    client.logout()
    window.location.href = '/login'
  }

  const { openLocation } = useActions(headerLogic)

  const menu = (
    <Menu>
      <MenuItem icon="user" text={email} />
      <MenuDivider />
      <MenuItem icon="new-person" text='Users' onClick={() => openLocation('/users')} />
      <MenuItem icon="cog" text='Settings' onClick={() => openLocation('/settings')} />
      <MenuDivider />
      <MenuItem icon="log-out" text='Log out' onClick={handleLogout} />
    </Menu>
  )

  return (
    <Popover content={menu} minimal position={Position.RIGHT_BOTTOM}>
      <Button className='bp3-minimal' icon='user' />
    </Popover>
  )
}
