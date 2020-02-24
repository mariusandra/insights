import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Button, Tooltip } from 'antd'

import explorerLogic from 'scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

export default function ControlsRight () {
  const { graphControls, graphTimeGroup } = useValues(explorerLogic)
  const { setGraphControls } = useActions(explorerLogic)

  const { cumulative, percentages, sort, type, labels, prediction } = graphControls

  return (
    <div className='right'>
      <Tooltip title='Show Cumulative Data'>
        <Button size='small' icon='rise' type={cumulative ? 'primary' : ''} onClick={() => setGraphControls({ cumulative: !cumulative })} />
      </Tooltip>

      <Tooltip title='Show as a percentage from the whole'>
        <Button size='small' icon='percentage' type={percentages ? 'primary' : ''} onClick={() => setGraphControls({ percentages: !percentages })} />
      </Tooltip>

      <Tooltip title={`Show prediction for the last ${graphTimeGroup} in the graph tooltip`}>
        <Button size='small' icon='question' type={prediction ? 'primary' : ''} onClick={() => setGraphControls({ prediction: !prediction })} />
      </Tooltip>

      <Tooltip title={`Show Labels`}>
        <Button size='small' icon='ordered-list' type={labels ? 'primary' : ''} onClick={() => setGraphControls({ labels: !labels })} />
      </Tooltip>

      <Button.Group>
        <Tooltip title={`Sort by value`}>
          <Button size='small' icon='number' type={sort === '123' ? 'primary' : ''} onClick={() => setGraphControls({ sort: '123' })} />
        </Tooltip>
        <Tooltip title={`Sort alphabetically`}>
          <Button size='small' icon='sort-ascending' type={sort === 'abc' ? 'primary' : ''} onClick={() => setGraphControls({ sort: 'abc' })} />
        </Tooltip>
      </Button.Group>

      <Button.Group>
        <Tooltip title='Area Chart'>
          <Button size='small' icon='area-chart' type={type === 'area' ? 'primary' : ''} onClick={() => setGraphControls({ type: 'area', compareWith: 0 })} />
        </Tooltip>
        <Tooltip title='Bar Chart'>
          <Button size='small' icon='bar-chart' type={type === 'bar' ? 'primary' : ''} onClick={() => setGraphControls({ type: 'bar' })} />
        </Tooltip>
        <Tooltip title='Line Chart'>
          <Button size='small' icon='line-chart' type={type === 'line' ? 'primary' : ''} onClick={() => setGraphControls({ type: 'line', compareWith: 0 })} />
        </Tooltip>
      </Button.Group>
    </div>
  )
}
