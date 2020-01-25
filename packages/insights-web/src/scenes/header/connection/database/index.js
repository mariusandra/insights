import React from 'react'
import { Popover, Button, Position, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";

function DatabaseMenu () {
  return (
    <Menu >
      <li className="bp3-menu-header"><h6 className="bp3-heading">$dbname</h6></li>
      <MenuItem text="Configure" icon="wrench" />
      <MenuDivider />
      <MenuItem text="New Connection" icon="plus" />
    </Menu>
  )
}

export default function Database () {
  return (
    <Popover content={<DatabaseMenu />} position={Position.RIGHT_BOTTOM} minimal>
      <Button icon='database' text='$dbname' />
    </Popover>
  )
}
