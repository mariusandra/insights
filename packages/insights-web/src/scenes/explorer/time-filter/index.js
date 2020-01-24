import React from 'react'
import { useActions, useValues } from 'kea'

import Select from 'lib/forms/select'

import explorerLogic from 'scenes/explorer/logic'

export default function TimeFilter () {
  const { graphTimeFilter } = useValues(explorerLogic)
  const { setGraphTimeFilter } = useActions(explorerLogic)

  const graphTimeFilters = [
    ['All time', 'all-time'],
    ['Last 2 years', 'last-730'],
    ['Last 365 days', 'last-365'],
    ['Last 60 days', 'last-60'],
    ['Last 30 days', 'last-30'],
    ['This month so far', 'this-month-so-far'],
    ['This month', 'this-month'],
    ['Last month', 'last-month'],
    ['Yesterday', 'yesterday'],
    ['Today', 'today'],
    ['2019', '2019'],
    ['2018', '2018'],
    ['2017', '2017'],
    ['2016', '2016'],
    ['2015', '2015'],
    ['2014', '2014'],
    ['2013', '2013']
  ]

  const options = graphTimeFilters.map(k => ({ id: k[1], name: k[0] }))

  return (
    <div style={{display: 'inline-block'}}>
      <Select value={graphTimeFilter} options={options} onValueChange={setGraphTimeFilter} />
    </div>
  )
}
