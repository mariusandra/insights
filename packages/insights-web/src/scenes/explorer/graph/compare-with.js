import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import PropTypes from 'prop-types'

import explorerLogic from 'scenes/explorer/logic'
import { Button } from 'antd'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

const compareWithForTimeGroup = {
  year: [0, 1, 2, 3, 4],
  quarter: [0, 1, 2, 4],
  month: [0, 1, 3, 6, 12, 24],
  week: [0, 1, 4, 12, 52],
  day: [0, 1, 7, 28, 364, 365]
}

const logic = kea({
  connect: {
    actions: [
      explorerLogic, [
        'setGraphControls'
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

export default function CompareWith () {
  const { graphControls, graphTimeGroup } = useValues(explorerLogic)
  const { setGraphControls } = useActions(explorerLogic)

  const { moreShown } = useValues(logic)
  const { showMore, showLess } = useActions(logic)

  const { compareWith, compareWithPercentageLine } = graphControls

  const options = compareWithForTimeGroup[graphTimeGroup]

  return (
    <div className='left'>
      <Button.Group>
        <Button size='small' type='' onClick={() => moreShown ? showLess() : showMore()}>
          Compare with
        </Button>
        {(moreShown ? options : compareWith ? [compareWith] : []).map(option => (
          <Button
            size='small'
            key={option}
            type={compareWith === option ? 'primary' : ''}
            onClick={() => moreShown ? setGraphControls({ compareWith: compareWith === option ? 0 : option, type: 'bar' }) : showMore()}>
            {option}
            {compareWith === option ? ` ${graphTimeGroup} ago` : ''}
          </Button>
        ))}
        {!!compareWith && compareWith !== 0 && (
          <Button
            size='small'
            type={compareWithPercentageLine ? 'primary' : ''}
            onClick={() => setGraphControls({ compareWithPercentageLine: !compareWithPercentageLine })}>
            {'%'}
          </Button>
        )}
      </Button.Group>
    </div>
  )
}
