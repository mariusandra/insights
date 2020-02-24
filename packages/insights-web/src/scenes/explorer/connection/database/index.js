import React from 'react'
import { useValues } from 'kea'
import { Button, Icon, Dropdown } from "antd"

import DatabaseForm from './form'
import ConnectionMenu from './menu'

import connectionsLogic from '../logic'

export default function Database ({ children }) {
  const { selectedConnection, isLoadingConnections } = useValues(connectionsLogic)

  return (
    <>
      <Dropdown overlay={<ConnectionMenu />} trigger={['click']}>
        {children || (
          <Button>
            <Icon type="database" theme={selectedConnection ? "filled" : ''} />
            <span className='button-text'>{isLoadingConnections ? '...' : (selectedConnection ? selectedConnection.name : 'Select Connection')}</span>
            <Icon type="down" className='arrow' />
          </Button>
        )}
      </Dropdown>
      <DatabaseForm />
    </>
  )
}
