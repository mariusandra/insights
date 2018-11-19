import './styles.scss'

import React, { Component } from 'react'
import { kea } from 'kea'
import PropTypes from 'prop-types'

import explorerLogic from '~/scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

const compareWithForTimeGroup = {
  year: [0, 1, 2, 3, 4],
  quarter: [0, 1, 2, 4],
  month: [0, 1, 3, 6, 12, 24],
  week: [0, 1, 4, 12, 52],
  day: [0, 1, 7, 28, 364, 365]
}

@kea({
  connect: {
    actions: [
      explorerLogic, [
        'setGraphControls'
      ]
    ],
    props: [
      explorerLogic, [
        'graphControls',
        'graphTimeGroup'
      ]
    ]
  },

  actions: () => ({
    showMore: true,
    showLess: true
  }),

  reducers: ({ actions }) => ({
    moreShown: [false, PropTypes.bool, {
      [actions.showMore]: () => true,
      [actions.showLess]: () => false,
      [actions.setGraphControls]: () => false
    }]
  })
})
export default class ControlsLeft extends Component {
  render () {
    const { graphControls, moreShown, graphTimeGroup } = this.props
    const { setGraphControls, showMore, showLess } = this.actions

    const { compareWith } = graphControls

    const options = compareWithForTimeGroup[graphTimeGroup]

    return (
      <div className='left'>
        <span className='control-group'>
          <span className='control' onClick={() => moreShown ? showLess() : showMore()}>
            Compare with
          </span>
          {(moreShown ? options : compareWith ? [compareWith] : []).map(option => (
            <span
              key={option}
              className={compareWith === option ? 'control selected' : 'control'}
              onClick={() => moreShown ? setGraphControls({ compareWith: compareWith === option ? 0 : option, type: 'bar' }) : showMore()}>
              {option}
            </span>
          ))}
        </span>
      </div>
    )
  }
}
