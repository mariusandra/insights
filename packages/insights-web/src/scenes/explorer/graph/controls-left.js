import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import PropTypes from 'prop-types'

import explorerLogic from 'scenes/explorer/logic'
import { Button } from 'antd'

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
      <Button.Group>
        <Button size='small' type={graphTimeGroup === 'day' ? 'primary' : ''} onClick={() => setGraphTimeGroupLocal('day')}>
          day
        </Button>
        <Button size='small' type={graphTimeGroup === 'week' ? 'primary' : ''} onClick={() => setGraphTimeGroupLocal('week')}>
          week
        </Button>
        <Button size='small' type={graphTimeGroup === 'month' ? 'primary' : ''} onClick={() => setGraphTimeGroupLocal('month')}>
          month
        </Button>
        {!moreShown && (
          <Button size='small' type='' onClick={showMore}>
            ...
          </Button>
        )}
        {moreShown && (
          <Button size='small' type={graphTimeGroup === 'quarter' ? 'primary' : ''} onClick={() => setGraphTimeGroupLocal('quarter')}>
            quarter
          </Button>
        )}
        {moreShown && (
          <Button size='small' type={graphTimeGroup === 'year' ? 'primary' : ''} onClick={() => setGraphTimeGroupLocal('year')}>
            year
          </Button>
        )}
      </Button.Group>
    </div>
  )
}
