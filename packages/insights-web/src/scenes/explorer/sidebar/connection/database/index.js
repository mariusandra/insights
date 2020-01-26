import React from 'react'
import { useActions, useValues } from 'kea'
import { Popover, Button, Position, Dialog, Overlay } from "@blueprintjs/core"

import AddDatabase from './add'
import DatabaseMenu from './menu'

import connectionsLogic from '../logic'

export default function Database () {
  const { selectedConnection, isLoading, isAddOpen } = useValues(connectionsLogic)
  const { closeAddConnection } = useActions(connectionsLogic)

  return (
    <>
      <Popover content={<DatabaseMenu />} position={Position.BOTTOM_LEFT} minimal>
        <Button icon='database' text={isLoading ? '...' : (selectedConnection ? selectedConnection.keyword : 'Select Connection')} />
      </Popover>
      <Dialog isOpen={isAddOpen} title='New Connection' onClose={closeAddConnection} canOutsideClickClose><AddDatabase /></Dialog>
    </>
  )
}
