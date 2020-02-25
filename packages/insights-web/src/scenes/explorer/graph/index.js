import './styles.scss'

import React, { Component } from 'react'
import { useValues } from 'kea'

import Dimensions from 'react-dimensions'
import { Graph } from 'insights-charts'

import CompareWith from './compare-with'
import ControlsRight from './controls-right'

import explorerLogic from 'scenes/explorer/logic'

function GraphView ({ containerHeight }) {
  const { graph, graphControls } = useValues(explorerLogic)

  return (
    <div className='graph-and-controls'>
      <div className='graph' style={{ height: containerHeight - 20 }}>
        <Graph
          graph={graph}
          controls={graphControls} />
      </div>
      <div className='controls'>
        <ControlsRight />
        <CompareWith />
      </div>
    </div>
  )
}

// Dimensions adds a ref to its children and functional components don't support them
class GraphViewContainer extends Component {
  render () {
    return <GraphView containerHeight={this.props.containerHeight} />
  }
}

export default Dimensions({ elementResize: true })(GraphViewContainer)
