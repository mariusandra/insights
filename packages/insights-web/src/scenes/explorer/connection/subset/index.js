import React from 'react'
import { useValues } from 'kea'
import { Button, Dropdown, Icon } from 'antd'

import SubsetForm from 'scenes/explorer/connection/subset/form'
import SubsetMenu from './menu'

import connectionsLogic from 'scenes/explorer/connection/logic'

export default function Subset ({ children }) {
  const { isLoadingSubsets, selectedSubset } = useValues(connectionsLogic)

  return (
    <>
      <Dropdown overlay={<SubsetMenu />} trigger={['click']}>
        {children || (
          <Button>
            <Icon type="bars" />
            {isLoadingSubsets ? '...' : (selectedSubset ? selectedSubset.name : 'No Name')}
            <Icon type="down" className='arrow' />
          </Button>
        )}
      </Dropdown>
      <SubsetForm />
    </>
  )
}
