// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components

// logic
import explorerLogic from '~/scenes/explorer/logic'


@connect({
  actions: [
    explorerLogic, [
    ]
  ],
  props: [
    explorerLogic, [
      'count',
      'visibleStart',
      'visibleEnd'
    ]
  ]
})
export default class Pagination extends Component {
  render () {
    const { count, visibleStart, visibleEnd } = this.props

    return (
      <div style={{lineHeight: '30px'}}>
        {count > 0 ? (
          <span>
            {visibleStart} - {visibleEnd} of
            {' '}
          </span>
        ) : null}
        {count} results
      </div>
    )
  }
}
