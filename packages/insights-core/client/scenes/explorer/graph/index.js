import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'

import { Graph } from 'insights-charts'

import explorerLogic from '~/scenes/explorer/logic'

const Controls = () => <div />

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

@connect({
  actions: [
    explorerLogic, [
      'setFacetsCount',
      'setGraphCumulative',
      'setPercentages',
      'setAlphabeticalFacets'
    ]
  ],
  props: [
    explorerLogic, [
      'facetsCount',
      'graphCumulative',
      'percentages',
      'alphabeticalFacets'
    ]
  ]
})
export default class GraphView extends Component {
  render () {
    const { graphCumulative, percentages, alphabeticalFacets } = this.props
    const { setGraphCumulative, setPercentages, setAlphabeticalFacets } = this.actions
    const type = 'bar'
    return (
      <div className='graph-and-controls'>
        <div className='graph'>
          <Graph
            graph={this.props.graph}
            graphKeys={this.props.graphKeys}
            graphData={this.props.graphData}
            controls={{
              type: 'bar',
              sort: alphabeticalFacets ? 'abc' : '123',
              cumulative: graphCumulative,
              percentages: percentages,
              labels: false
            }} />
        </div>
        <div className='controls'>
          <div className='right'>
            <span
              className={graphCumulative ? 'control selected' : 'control'}
              onClick={() => setGraphCumulative(!graphCumulative)}>
              +
            </span>

            <span
              className={percentages ? 'control selected' : 'control'}
              onClick={() => setPercentages(!percentages)}>
              %
            </span>

            <span className='control-group' onClick={() => setAlphabeticalFacets(!alphabeticalFacets)}>
              <span className={alphabeticalFacets ? 'control selected' : 'control'}>
                abc
              </span>
              <span className={!alphabeticalFacets ? 'control selected' : 'control'}>
                123
              </span>
            </span>

            <span className='control-group' onClick={() => {}}>
              <span className={type === 'bar' ? 'control selected' : 'control'}>
                bar
              </span>
              <span className={type === 'line' ? 'control selected' : 'control'}>
                line
              </span>
            </span>
          </div>
        </div>
      </div>
    )
  }
}
