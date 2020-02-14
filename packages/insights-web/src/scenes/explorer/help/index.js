import './styles.scss'

import React from 'react'
import { useValues } from 'kea'
import { Alert, Icon } from 'antd'

import explorerLogic from 'scenes/explorer/logic'

export default function Help () {
  const { selectedModel, structure } = useValues(explorerLogic)

  const idField = selectedModel && structure[selectedModel] && structure[selectedModel].primary_key

  return (
    <div className='explorer-help'>
      <Alert
        message="Tips for using Insights"
        description={
          <ol style={{ margin: 0, marginTop: 10, padding: 0, paddingLeft: 25 }}>
            <li>Add a field from the sidebar to start exploring your data</li>
            <li>Check the table headers for aggregate functions like <strong>count</strong>{idField ? ` (${idField})` : ''}, <strong>avg</strong> and <strong>sum</strong></li>
            <li>When you have selected 1) one aggregated field and 2) one date or time field, you will get a cool graph <Icon type="area-chart" /></li>
            <li>Use filters <Icon type='filter' style={{ color: 'hsl(209, 32%, 40%)' }} theme='filled' /> to drill down into the data</li>
            <li>Once you have a view that you like, save it <Icon type='star' style={{ color: 'hsl(42, 98%, 45%)' }} theme='filled' /> for later!</li>
          </ol>
        }
        type="success"
        showIcon
      />
    </div>
  )
}
