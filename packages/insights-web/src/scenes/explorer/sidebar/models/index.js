import React from 'react'
import { useActions, useValues } from 'kea'

import { Empty, Icon, Tree } from 'antd'

import HighlightText from 'lib/utils/highlight-text'

import connectionLogic from '../../connection/logic'
import explorerLogic from '../../logic'

const { TreeNode } = Tree;

export default function Models () {
  const { connectionId } = useValues(connectionLogic)
  const { models, filteredModels, search, selectedKey } = useValues(explorerLogic)
  const { openModel } = useActions(explorerLogic)

  if (!connectionId) {
    return <p style={{ textAlign: 'center', padding: '0 20px' }}>Please select a connection</p>
  }

  if (models.length === 0) {
    return <Empty description='No tables found in this connection' style={{ marginTop: 60 }} />
  }

  return (
    <div className='model-list'>
      <Tree
        showIcon
        blockNode
        selectable
        selectedKeys={[selectedKey]}
        onSelect={([model]) => openModel(model || selectedKey)}
      >
        {filteredModels.map(model => (
          <TreeNode
            title={search ? <HighlightText highlight={search}>{model}</HighlightText> : model}
            key={model}
            switcherIcon={<Icon type='right' style={{ color: 'hsla(209, 66%, 54%, 1)' }} />}
          />
        ))}
      </Tree>
    </div>
  )
}
