import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'

import Tooltip from 'rc-tooltip'
import OneFilter from 'scenes/explorer/filter/one-filter'

import explorerLogic from 'scenes/explorer/logic'
import { Icon } from 'antd'

const connection = {
  actions: [
    explorerLogic, [
      'addFilter',
      'openTreeNodeFilter'
    ]
  ],
  props: [
    explorerLogic, [
      'treeNodeFilterOpen',
      'filterKeys',
      'filter'
    ]
  ]
}
class FilterButton extends Component {
  static propTypes = {
    path: PropTypes.string
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.path !== this.props.path ||
           nextProps.filterKeys !== this.props.filterKeys ||
           nextProps.filter !== this.props.filter ||
           (nextProps.treeNodeFilterOpen === nextProps.path) !== (this.props.treeNodeFilterOpen === this.props.path)
  }

  addAnotherFilter = () => {
    const { path } = this.props
    const { addFilter } = this.props.actions
    const fieldPath = path.indexOf('...pinned.') === 0 ? path.substring('...pinned.'.length) : path

    addFilter({ key: fieldPath, value: '' })
  }

  openFilter = () => {
    const { path } = this.props
    const { openTreeNodeFilter } = this.props.actions

    openTreeNodeFilter(path)
  }

  closeFilter = () => {
    const { openTreeNodeFilter } = this.props.actions

    openTreeNodeFilter(null)
  }

  render () {
    const { path, treeNodeFilterOpen, filterKeys, filter } = this.props

    const fieldPath = path.indexOf('...pinned.') === 0 ? path.substring('...pinned.'.length) : path

    const filterIndex = filterKeys.indexOf(fieldPath)
    const filterOpen = treeNodeFilterOpen === path
    const filterCount = filterKeys.filter(k => k === fieldPath).length

    if (filterOpen) {
      if (filterCount === 1 || filterCount === 0) {
        return (
          <OneFilter
            placement='right'
            index={filterIndex}
            value={filterIndex >= 0 ? filter[filterIndex].value : undefined}
            column={fieldPath}
            forceOpen
            onClose={this.closeFilter}>
            <span className='filter-button filter-filled' onClick={this.closeFilter}><Icon type="filter" theme='filled' /></span>
          </OneFilter>
        )
      } else {
        let i = 0

        return (
          <Tooltip
            visible
            placement={'right'}
            overlay={(
              <div>
                {filter.map(({ key, value }) => {
                  if (key !== fieldPath) {
                    i += 1
                    return null
                  }

                  return (
                    <div key={i} style={{marginBottom: 5}}>
                      <OneFilter column={key} value={value} index={i++} placement='right' />
                    </div>
                  )
                })}
                <div
                  onClick={this.addAnotherFilter}
                  style={{paddingTop: 10, marginTop: 10, borderTop: '1px solid green', cursor: 'pointer', color: 'green'}}>
                  Add another filter
                </div>
              </div>
            )}>
            <span className='filter-button filter-filled' onClick={this.closeFilter}><Icon type="filter" theme='filled' /></span>
          </Tooltip>
        )
      }
    } else {
      return (
        <span className={`filter-button${filterCount > 0 ? ' filter-filled' : ''}`} onClick={this.openFilter}><Icon type="filter" theme={filterCount > 0 ? 'filled' : ''} /></span>
      )
    }
  }
}
const ConnectedFilterButton = connect(connection)(FilterButton)
export default ConnectedFilterButton
