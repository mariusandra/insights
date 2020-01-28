import React, { useState } from 'react'
import { useValues } from 'kea'
import { Button, Icon, Dropdown } from "antd"

import AddDatabase from './add'
import DatabaseMenu from './menu'

import connectionsLogic from '../logic'

export default function Database () {
  const { selectedConnection, isLoading } = useValues(connectionsLogic)

  const [visible, setVisible] = useState(false)

  return (
    <>
      <Dropdown overlay={<DatabaseMenu hide={() => setVisible(false)} />} trigger={['click']} visible={visible} >
        <Button onClick={() => setVisible(!visible)}>
          <Icon type="database" theme="filled" />
          {isLoading ? '...' : (selectedConnection ? selectedConnection.keyword : 'Select Connection')}
          <Icon type="down" />
        </Button>
      </Dropdown>
      <AddDatabase />
    </>
  )
}
