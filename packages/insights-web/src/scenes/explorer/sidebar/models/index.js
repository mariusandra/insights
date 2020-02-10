import React from 'react'
import { useActions, useValues } from 'kea'

import { Empty } from 'antd'

import HighlightText from 'lib/utils/highlight-text'

import connectionLogic from '../../connection/logic'
import explorerLogic from '../../logic'

export default function Models () {
  const { connectionId } = useValues(connectionLogic)
  const { models, filteredModels, search } = useValues(explorerLogic)
  const { openModel } = useActions(explorerLogic)

  if (!connectionId) {
    return <p style={{ textAlign: 'center', padding: '0 20px' }}>Please select a connection</p>
  }

  if (models.length === 0) {
    return <Empty description='No tables found in this connection' style={{ marginTop: 60 }} />
  }

  return (
    <div className='model-list'>
      {filteredModels.map(model => (
        <div key={model} onClick={() => openModel(model)} className='model-list-item'>
          {search ? <HighlightText highlight={search}>{model}</HighlightText> : model}
        </div>
      ))}
    </div>
  )
}
