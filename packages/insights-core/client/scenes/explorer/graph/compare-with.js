import './styles.scss'

import React, { Component } from 'react'
import { kea } from 'kea'
import PropTypes from 'prop-types'

import explorerLogic from '~/scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

@kea({
  connect: {
    actions: [
      explorerLogic, [
        'setGraphControls'
      ]
    ],
    props: [
      explorerLogic, [
        'graphControls'
      ]
    ]
  },

  actions: () => ({
    showMore: true
  }),

  reducers: ({ actions }) => ({
    moreShown: [false, PropTypes.bool, {
      [actions.showMore]: () => true,
      [actions.setGraphControls]: () => false
    }]
  })
})
export default class ControlsLeft extends Component {
  render () {
    const { graphControls, moreShown } = this.props
    const { setGraphControls, showMore } = this.actions

    const { compareWith } = graphControls

    return (
      <div className='left'>
        <span className='control-group'>
          <span className='control' onClick={() => setGraphControls({ compareWith: null })}>
            Compare with
          </span>
          {(moreShown || compareWith === 'year') && (
            <span className={compareWith === 'year' ? 'control selected' : 'control'} onClick={() => setGraphControls({ compareWith: compareWith === 'year' ? null : 'year' })}>
              last year
            </span>
          )}
          {(moreShown || compareWith === 'quarter') && (
            <span className={compareWith === 'quarter' ? 'control selected' : 'control'} onClick={() => setGraphControls({ compareWith: compareWith === 'quarter' ? null : 'quarter' })}>
              last quarter
            </span>
          )}
          {(moreShown || compareWith === 'month') && (
            <span className={compareWith === 'month' ? 'control selected' : 'control'} onClick={() => setGraphControls({ compareWith: compareWith === 'month' ? null : 'month' })}>
              last month
            </span>
          )}
          {!moreShown && (
            <span className='control' onClick={showMore}>
              ...
            </span>
          )}
        </span>
      </div>
    )
  }
}
