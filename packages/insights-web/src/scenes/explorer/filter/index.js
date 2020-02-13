import './styles.scss'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'kea'
import Dimensions from 'react-dimensions'

import { Icon } from 'antd'

import OneFilter from './one-filter'

import explorerLogic from 'scenes/explorer/logic'

const logic = connect({
  props: [
    explorerLogic, [
      'filter'
    ]
  ]
})

class Filter extends Component {
  static propTypes = {
    setFilterHeight: PropTypes.func
  }

  componentDidUpdate () {
    const { setFilterHeight, filterHeight } = this.props

    const element = this.refs.filter
    if (element && element.clientHeight) {
      if (filterHeight !== element.clientHeight) {
        setFilterHeight(element.clientHeight)
      }
    }
  }

  render () {
    const { filter } = this.props

    let i = 0

    return (
      <div className='insights-filter' ref='filter'>
        <div className='filter-header'>
          <span className='header-text'>
            Filters:
          </span>
          <span className='filter-preview'>
            {filter.map(({ key, value }) => (
              <OneFilter key={`${i}.${key}`} filterPrefix={`...filters.${i}`} column={key} value={value} index={i++} />
            ))}
            {filter.length === 0 ? (
              <span className='filter-placeholder'>Add filters by clicking the <Icon type='filter' /> icons next to fields or in the table headers</span>
            ) : null}
          </span>
        </div>
      </div>
    )
  }
}

export default logic(Dimensions({ elementResize: true })(Filter))
