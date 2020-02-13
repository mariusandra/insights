import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Icon, Tooltip } from 'antd'

import explorerLogic from 'scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

export default function ControlsRight () {
  const { graphControls, graphTimeGroup } = useValues(explorerLogic)
  const { setGraphControls } = useActions(explorerLogic)

  const { cumulative, percentages, sort, type, labels, prediction } = graphControls

  return (
    <div className='right'>
      <Tooltip title='Show Cumulative Data'>
        <span
          className={cumulative ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ cumulative: !cumulative })}>
          <Icon type="rise" />
        </span>
      </Tooltip>

      <Tooltip title='Show as a percentage from the whole'>
        <span
          className={percentages ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ percentages: !percentages })}>
          <Icon type="percentage" />
        </span>
      </Tooltip>

      <Tooltip title={`Show prediction for the last ${graphTimeGroup} in the graph tooltip`}>
        <span
          className={prediction ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ prediction: !prediction })}>
          <Icon type="question" />
        </span>
      </Tooltip>

      <Tooltip title={`Show Labels`}>
        <span
          className={labels ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ labels: !labels })}>
          <Icon type="ordered-list" />
        </span>
      </Tooltip>

      <span className='control-group' onClick={() => setGraphControls({ sort: sort === 'abc' ? '123' : 'abc' })}>
        <Tooltip title={`Sort by value`}>
          <span className={sort === '123' ? 'control selected' : 'control'}>
            <Icon type="number" />
          </span>
        </Tooltip>
        <Tooltip title={`Sort alphabetically`}>
          <span className={sort === 'abc' ? 'control selected' : 'control'}>
            <Icon type="sort-ascending" />
          </span>
        </Tooltip>
      </span>

      <span className='control-group'>
        <Tooltip title='Area Chart'>
          <span className={type === 'area' ? 'control selected' : 'control'} onClick={() => setGraphControls({ type: 'area', compareWith: 0 })}>
            <Icon type="area-chart" />
          </span>
        </Tooltip>
        <Tooltip title='Bar Chart'>
          <span className={type === 'bar' ? 'control selected' : 'control'} onClick={() => setGraphControls({ type: 'bar' })}>
            <Icon type="bar-chart" />
          </span>
        </Tooltip>
        <Tooltip title='Line Chart'>
          <span className={type === 'line' ? 'control selected' : 'control'} onClick={() => setGraphControls({ type: 'line', compareWith: 0 })}>
            <Icon type="line-chart" />
          </span>
        </Tooltip>
      </span>
    </div>
  )
}
