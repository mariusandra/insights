import React from 'react'
import { ButtonGroup, Popover, Button, Position, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";

function SubsetMenu () {
  return (
    <Menu >
      <li className="bp3-menu-header"><h6 className="bp3-heading">All Data</h6></li>
      <MenuItem text="Configure" icon="wrench" />
      <MenuDivider />
      <MenuItem text="Accounting" icon="layer" />
      <MenuItem text="Marketing" icon="layer" />
      <MenuDivider />
      <MenuItem text="Create Subset" icon="new-layer" />
    </Menu>
  )
}

export default function Subset () {
  return (
    <Popover content={<SubsetMenu />} position={Position.RIGHT_BOTTOM} minimal>
      <Button icon='layers' text='All Data' />
    </Popover>
  )
}
