import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils
import Dimensions from 'react-dimensions'

// components
import OneFilter from './one-filter'

// logic
import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
    ]
  ],
  props: [
    explorerLogic, [
      'filter'
    ]
  ]
})
@Dimensions({ elementResize: true })
export default class Filter extends Component {
  render () {
    const { filter } = this.props

    let i = 0

    return (
      <div className='insights-filter'>
        <div className='filter-header'>
          <span className='header-text'>
            Filter:
          </span>
          <span className='filter-preview'>
            {filter.map(({ key, value }) => (
              <OneFilter key={i} column={key} value={value} index={i++} />
            ))}
          </span>
        </div>
      </div>
    )
  }
}
