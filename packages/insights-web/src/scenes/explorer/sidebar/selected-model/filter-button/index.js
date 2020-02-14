import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'

import OneFilter from 'scenes/explorer/filter/one-filter'

import explorerLogic from 'scenes/explorer/logic'
import { Button, Icon, Popover } from 'antd'

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

export function ColumnFilters ({ filter, path, onAddClick }) {
  let i = 0
  let hasFilters = false
  return <div>
    {filter.map(({key, value}) => {
      if (key !== path) {
        i += 1
        return null
      }
      hasFilters = true
      return (
        <div key={`${i}.${key}.${value}`} style={{marginBottom: 15}}>
          <OneFilter filterPrefix={`...tree.${i}`} column={key} value={value} index={i++} placement='right'/>
        </div>
      )
    }).filter(v => v)}

    <div style={{ marginTop: hasFilters ? 20 : 0 }}>
      <Button onClick={onAddClick}>
        <Icon type='plus'/> Add {hasFilters ? 'another' : 'a'} filter
      </Button>
    </div>
  </div>
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
              <ColumnFilters filter={filter} path={fieldPath} onAddClick={this.addAnotherFilter}/>
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
