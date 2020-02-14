import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'

import OneFilter from 'scenes/explorer/filter/one-filter'
import { ColumnFilters } from 'scenes/explorer/filter/column-filters'

import explorerLogic from 'scenes/explorer/logic'
import { Icon, Popover } from 'antd'

function pathInTreeFilter (path, treeNodeFilterOpen) {
  return treeNodeFilterOpen === `...tree.X.${path}` ||
    (treeNodeFilterOpen && treeNodeFilterOpen.indexOf('...tree.') === 0 && treeNodeFilterOpen.substring('...tree.'.length).split('.').slice(1).join('.') === path)
}

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
           pathInTreeFilter(nextProps.path, nextProps.treeNodeFilterOpen) !== pathInTreeFilter(this.props.path, this.props.treeNodeFilterOpen)
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

    openTreeNodeFilter(`...tree.X.${path}`)
  }

  closeFilter = () => {
    const { openTreeNodeFilter } = this.props.actions

    openTreeNodeFilter(null)
  }

  render () {
    const { path, treeNodeFilterOpen, filterKeys, filter } = this.props

    const fieldPath = path.indexOf('...pinned.') === 0 ? path.substring('...pinned.'.length) : path

    const filterIndex = filterKeys.indexOf(fieldPath)
    const filterOpen = pathInTreeFilter(path, treeNodeFilterOpen)
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
            filterPrefix='...tree.X'
            onClose={this.closeFilter}>
            <span className='filter-button filter-filled' onClick={this.closeFilter}><Icon type="filter" theme='filled' /></span>
          </OneFilter>
        )
      } else {
        return (
          <Popover
            visible
            trigger='click'
            title={fieldPath}
            onVisibleChange={visible => !visible && this.closeFilter()}
            placement='right'
            content={(
              <ColumnFilters filter={filter} path={fieldPath} onAddClick={this.addAnotherFilter} filterPrefixString='tree' />
            )}>
            <span className='filter-button filter-filled' onClick={this.closeFilter}><Icon type="filter" theme='filled' /></span>
          </Popover>
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
