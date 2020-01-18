import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'

import Dimensions from 'react-dimensions'
import { Graph } from 'insights-charts'

import ControlsLeft from './controls-left'
import CompareWith from './compare-with'
import ControlsRight from './controls-right'

import explorerLogic from 'scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

const logic = connect({
  props: [
    explorerLogic, [
      'graph',
      'graphControls',
      'graphTimeGroup'
    ]
  ]
})

class GraphView extends Component {
  render () {
    const { graph, graphControls, containerHeight } = this.props

    return (
      <div className='graph-and-controls'>
        <div className='graph' style={{ height: containerHeight - 20 }}>
          <Graph
            graph={graph}
            controls={graphControls} />
        </div>
        <div className='controls'>
          <ControlsLeft />
          <CompareWith />
          <ControlsRight />
        </div>
      </div>
    )
  }
}

export default Dimensions({ elementResize: true })(logic(GraphView))
