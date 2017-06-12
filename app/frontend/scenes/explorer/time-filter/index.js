// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils
import Select from 'lib/forms/select'

// components

// logic
import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'setGraphTimeFilter'
    ]
  ],
  props: [
    explorerLogic, [
      'graphTimeFilter'
    ]
  ]
})
export default class TimeFilter extends Component {
  render () {
    const { graphTimeFilter } = this.props
    const { setGraphTimeFilter } = this.props.actions

    const graphTimeFilters = [['All time', 'all-time'], ['Last 2 years', 'last-730'], ['Last 365 days', 'last-365'], ['Last 60 days', 'last-60'], ['Last 30 days', 'last-30'], ['This month so far', 'this-month-so-far'], ['This month', 'this-month'], ['Last month', 'last-month'], ['2015', '2015'], ['2014', '2014'], ['2013', '2013']]

    const options = graphTimeFilters.map(k => ({ id: k[1], name: k[0] }))

    return (
      <div style={{display: 'inline-block'}}>
        <Select value={graphTimeFilter} options={options} onValueChange={setGraphTimeFilter} />
      </div>
    )
  }
}
