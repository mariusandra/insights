import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import PropTypes from 'prop-types'

import explorerLogic from 'scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

const logic = kea({
  connect: {
    actions: [
      explorerLogic, [
        'setGraphTimeGroup',
      ]
    ]
  },

  actions: () => ({
    showMore: true
  }),

  reducers: ({ actions }) => ({
    moreShown: [false, PropTypes.bool, {
      [actions.showMore]: () => true,
      [actions.setGraphTimeGroup]: (_, { graphTimeGroup }) => graphTimeGroup === 'quarter' || graphTimeGroup === 'year'
    }]
  })
})

export default function ControlsLeft () {
  const { graphTimeGroup } = useValues(explorerLogic)
  const { setGraphTimeGroup, setGraphControls } = useActions(explorerLogic)

  const { moreShown } = useValues(logic)
  const { showMore } = useActions(logic)

  function setGraphTimeGroupLocal (graphTimeGroup) {
    setGraphTimeGroup(graphTimeGroup)
    setGraphControls({ compareWith: 0 })
  }

  return (
    <div className='left'>
      <span className='control-group'>
        <span className={graphTimeGroup === 'day' ? 'control selected' : 'control'} onClick={() => setGraphTimeGroupLocal('day')}>
          day
        </span>
        <span className={graphTimeGroup === 'week' ? 'control selected' : 'control'} onClick={() => setGraphTimeGroupLocal('week')}>
          week
        </span>
        <span className={graphTimeGroup === 'month' ? 'control selected' : 'control'} onClick={() => setGraphTimeGroupLocal('month')}>
          month
        </span>
        {!moreShown && (
          <span className='control' onClick={showMore}>
            ...
          </span>
        )}
        {moreShown && (
          <span className={graphTimeGroup === 'quarter' ? 'control selected' : 'control'} onClick={() => setGraphTimeGroupLocal('quarter')}>
            quarter
          </span>
        )}
        {moreShown && (
          <span className={graphTimeGroup === 'year' ? 'control selected' : 'control'} onClick={() => setGraphTimeGroupLocal('year')}>
            year
          </span>
        )}
      </span>
    </div>
  )
}
