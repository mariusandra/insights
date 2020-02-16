import React from 'react'
import { useActions, useValues } from 'kea'

import { Empty, Icon, Tree, Alert } from 'antd'

import HighlightText from 'lib/utils/highlight-text'

import connectionLogic from '../../connection/logic'
import explorerLogic from '../../logic'
import logic from './logic'

const { TreeNode } = Tree;

export default function Models () {
  const { connectionId } = useValues(connectionLogic)
  const { models, filteredModels, search, selectedKey } = useValues(explorerLogic)
  const { pinnedPerModel, viewsPerModel } = useValues(logic)
  const { openModel } = useActions(explorerLogic)

  if (!connectionId) {
    return (
      <Alert
        message="Next action!"
        description={<>Please select a <Icon type='database' /> connection.</>}
        type="success"
        icon={<Icon type="forward" />}
        style={{ margin: '0px 10px' }}
        showIcon
      />
    )
  }

  if (models.length === 0) {
    return <Empty description='No Models exported by this connection...' style={{ marginTop: 60 }} />
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
            title={
              <div>
                {search ? <HighlightText highlight={search}>{model}</HighlightText> : model}
                <span className='icons-sidebar-part'>
                  {viewsPerModel[model] ? <Icon type='star' theme='filled' title={`${viewsPerModel[model]} star${viewsPerModel[model] === 1 ? '' : 's'}`} style={{ color: 'hsl(42, 98%, 45%)' }} /> : null}
                  {pinnedPerModel[model] ? <Icon type='pushpin' theme='filled' title={`${pinnedPerModel[model]} pin${pinnedPerModel[model] === 1 ? '' : 's'}`} style={{ color: 'hsl(3, 77%, 42%)' }} /> : null}
                </span>
              </div>
            }
            key={model}
            switcherIcon={<Icon type='right' style={{ color: 'hsla(209, 66%, 54%, 1)', transform: "scale(0.833)" }} />}
          />
        ))}
      </Tree>
    </div>
  )
}
