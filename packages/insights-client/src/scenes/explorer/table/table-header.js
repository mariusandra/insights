import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'

import Tooltip from 'rc-tooltip'

import ColumnSettings from './column-settings'

import getMeta from 'lib/explorer/get-meta'

import explorerLogic from '~/scenes/explorer/logic'

const logic = connect({
  actions: [
    explorerLogic, [
      'setSort'
    ]
  ],
  props: [
    explorerLogic, [
      'sort',
      'columnsMeta',
      'filter',
      'structure',
      'facetsColumn'
    ]
  ]
})

class TableHeader extends Component {
  static propTypes = {
    column: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      tooltipHover: false
    }
  }

  handleSort = () => {
    const { sort, column, columnsMeta, structure } = this.props
    const { setSort } = this.props.actions
    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    // strings default to ascending, everything else to descending
    if (meta.type === 'string' ? sort === column : sort !== `-${column}`) {
      setSort(`-${column}`)
    } else {
      setSort(column)
    }
  }

  handleTooltip = (tooltipHover) => {
    this.setState({ tooltipHover })
  }

  render () {
    const { index, column, sort, columnsMeta, filter, structure, facetsColumn } = this.props
    const { tooltipHover } = this.state

    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    const isSorted = sort === column || sort === `-${column}`
    const descending = sort === `-${column}`

    const overlay = (
      <div>
        <ColumnSettings index={index} column={column} />
      </div>
    )

    let className = 'cell-header ' + (isSorted ? ` sorted${descending ? ' descending' : ''}` : '')
    if (filter.some(({ key, value }) => key === column)) {
      className = `filter-active ${className}`
    }
    if (tooltipHover) {
      className = `${className} hover`
    }
    if (facetsColumn === column) {
      className = `${className} facets`
    }

    const localPath = (column.split('!')[0] || '').replace(/^[^.]+\./, '').split('.').reverse().join(' < ')

    return (
      <Tooltip placement='bottomLeft' trigger={['hover']} overlay={overlay} onVisibleChange={this.handleTooltip}>
        <div className={className} onClick={this.handleSort}>
          {meta && meta.aggregate && (
            <span className='filter-aggregate'>{meta.aggregate}</span>
          )}
          {meta && meta.transform && (
            <span className='filter-transform'>{meta.transform}</span>
          )}
          {facetsColumn === column && (
            <span className='filter-split'>split</span>
          )}
          {localPath}
        </div>
      </Tooltip>
    )
  }
}

export default logic(TableHeader)
