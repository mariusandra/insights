import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'

import explorerLogic from '~/scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

@connect({
  actions: [
    explorerLogic, [
      'setGraphControls'
    ]
  ],
  props: [
    explorerLogic, [
      'graphControls',
      'facetsColumn'
    ]
  ]
})
export default class ControlsRight extends Component {
  render () {
    const { graphControls } = this.props
    const { setGraphControls } = this.actions

    const { cumulative, percentages, sort, type, labels } = graphControls

    return (
      <div className='right'>
        <span
          className={cumulative ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ cumulative: !cumulative })}>
          +
        </span>

        <span
          className={percentages ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ percentages: !percentages })}>
          %
        </span>

        <span
          className={labels ? 'control selected' : 'control'}
          onClick={() => setGraphControls({ labels: !labels })}>
          labels
        </span>

        <span className='control-group' onClick={() => setGraphControls({ sort: sort === 'abc' ? '123' : 'abc' })}>
          <span className={sort === '123' ? 'control selected' : 'control'}>
            123
          </span>
          <span className={sort === 'abc' ? 'control selected' : 'control'}>
            abc
          </span>
        </span>

        <span className='control-group'>
          <span className={type === 'area' ? 'control selected' : 'control'} onClick={() => setGraphControls({ type: 'area' })}>
            area
          </span>
          <span className={type === 'bar' ? 'control selected' : 'control'} onClick={() => setGraphControls({ type: 'bar' })}>
            bar
          </span>
          <span className={type === 'line' ? 'control selected' : 'control'} onClick={() => setGraphControls({ type: 'line' })}>
            line
          </span>
        </span>
      </div>
    )
  }
}
