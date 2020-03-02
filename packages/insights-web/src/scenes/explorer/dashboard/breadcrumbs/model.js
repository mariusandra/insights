import React from 'react'
import { useActions, useValues } from 'kea'
import explorerLogic from '../../logic'

import { Button, Dropdown, Icon, Menu } from 'antd'

function ModelMenu () {
  const { models, selectedModel } = useValues(explorerLogic)
  const { openModel } = useActions(explorerLogic)

  return (
    <Menu className='scrollable-menu'>
      {selectedModel ? <Menu.ItemGroup className='connection-menu-header-title' title={
        <>
          <Icon type="table" style={{ marginRight: 6 }} />
          <span>{selectedModel ? selectedModel : '...'}</span>
        </>
      } /> : null}

      {selectedModel ? <Menu.Divider /> : null}

      {models.map(model => (
        <Menu.Item key={model} onClick={() => openModel(model)}>
          <Icon type="table" />
          {model}
        </Menu.Item>
      ))}
    </Menu>
  )
}

export default function Model ({ children }) {
  const { selectedModel } = useValues(explorerLogic)

  return (
    <>
      <Dropdown overlay={<ModelMenu />} trigger={['click']}>
        {children || (
          <Button>
            <Icon type="table" />
            {selectedModel ? selectedModel : 'No Name'}
            <Icon type="down" className='arrow' />
          </Button>
        )}
      </Dropdown>
    </>
  )
}
