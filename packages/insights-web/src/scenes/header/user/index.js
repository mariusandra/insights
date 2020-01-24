import React from 'react'

import client from 'lib/client'
import { Button, Popover, Position, Menu, MenuItem, MenuDivider } from "@blueprintjs/core"

export default function User ({ email }) {
  function handleLogout (e) {
    e.preventDefault()
    client.logout()
    window.location.href = '/login'
  }

  const menu = (
    <Menu>
      <MenuItem icon="user" text={email} />
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
