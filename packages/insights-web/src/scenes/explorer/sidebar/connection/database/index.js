import React from 'react'
import { useValues } from 'kea'
import { Button, Icon, Dropdown } from "antd"

import AddDatabase from './add'
import DatabaseMenu from './menu'

import connectionsLogic from '../logic'

export default function Database () {
  const { selectedConnection, isLoading } = useValues(connectionsLogic)

  return (
    <>
      <Dropdown overlay={<DatabaseMenu />} trigger={['click']} >
        <Button>
          <Icon type="database" theme="filled" />
          {isLoading ? '...' : (selectedConnection ? selectedConnection.keyword : 'Select Connection')}
          <Icon type="down" />
        </Button>
      </Dropdown>
      <AddDatabase />
    </>
  )
}
