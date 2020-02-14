import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import { Select, Tag, Icon } from 'antd'

import range from 'lib/utils/range'

import getMeta from 'lib/explorer/get-meta'

import explorerLogic from 'scenes/explorer/logic'

const logic = connect({
  actions: [
    explorerLogic, [
      'setSort',
      'removeColumnWithIndex',
      'addEmptyFilter',
      'removeFiltersByKey',
      'setTransform',
      'setFacetsColumn',
      'setFacetsCount'
    ]
  ],
  props: [
    explorerLogic, [
      'sort',
      'filter',
      'columnsMeta',
      'structure',
      'facetsColumn',
      'facetsCount'
    ]
  ]
})

class TableHeader extends Component {
  static propTypes = {
    index: PropTypes.number,
    column: PropTypes.string
  }

  handleSort = () => {
    const { sort, column } = this.props
    const { setSort } = this.actions

    if (sort === column) {
      setSort(`-${column}`)
    } else {
      setSort(column)
    }
  }

  handleRemove = () => {
    const { index, facetsColumn, column } = this.props
    const { removeColumnWithIndex, setFacetsColumn } = this.actions

    removeColumnWithIndex(index)

    if (facetsColumn === column) {
      setFacetsColumn(null)
    }
  }

  renderTransform (meta) {
    const { index, column } = this.props
    const { setTransform } = this.actions

    const [ , transform, aggregate ] = column.split('!')

    if (meta.type !== 'time' && meta.type !== 'date') {
      return <div />
    }

    return (
      <div className='filter-options'>
        <Tag color={!transform ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, '', aggregate)} style={{ cursor: 'pointer' }}>{meta.type === 'date' ? 'Day' : 'Time'}</Tag>
        {meta.type === 'time' ? (
          <Tag color={transform === 'day' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, 'day', aggregate)} style={{ cursor: 'pointer' }}>Day</Tag>
        ) : null}
        <Tag color={transform === 'week' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, 'week', aggregate)} style={{ cursor: 'pointer' }}>Week</Tag>
        <Tag color={transform === 'month' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, 'month', aggregate)} style={{ cursor: 'pointer' }}>Month</Tag>
        <Tag color={transform === 'quarter' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, 'quarter', aggregate)} style={{ cursor: 'pointer' }}>Quarter</Tag>
        <Tag color={transform === 'year' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, 'year', aggregate)} style={{ cursor: 'pointer' }}>Year</Tag>
      </div>
    )
  }

  renderFacets (meta) {
    const { facetsColumn, column, facetsCount } = this.props
    const { setFacetsColumn, setFacetsCount } = this.actions

    if (meta.type !== 'string' && meta.type !== 'boolean') {
      return null
    }

    return (
      <div className='filter-options'>
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: facetsColumn === column ? 'bold' : 'normal'}}
          onClick={() => setFacetsColumn(facetsColumn === column ? null : column)}>Split the graph by this column</span>

        {facetsColumn === column && (
          <div>
            <span>Split count:</span>
            {' '}
            <Select value={facetsCount} onChange={(v) => setFacetsCount(parseInt(v) || 0)} style={{display: 'inline-block', margin: 0}}>
              {range(1, 20).map(i => (
                <Select.Option value={i} key={i}>{i}</Select.Option>
              ))}
            </Select>
          </div>
        )}
      </div>
    )
  }

  renderAggregate (meta) {
    const { index, column } = this.props
    const { setTransform } = this.actions

    const [ , transform, aggregate ] = column.split('!')

    if (meta.index !== 'primary_key' && meta.type !== 'string' && meta.type !== 'number') {
      return null
    }

    return (
      <div className='filter-options'>
        {meta.index === 'primary_key' ? (
          <Tag color={aggregate === 'count' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, transform, aggregate === 'count' ? '' : 'count')} style={{ cursor: 'pointer' }}>Count</Tag>
        ) : null}
        {meta.type === 'string' || meta.type === 'number' ? (
          <>
            <Tag color={aggregate === 'min' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, transform, aggregate === 'min' ? '' : 'min')} style={{ cursor: 'pointer' }}>Min</Tag>
            <Tag color={aggregate === 'max' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, transform, aggregate === 'max' ? '' : 'max')} style={{ cursor: 'pointer' }}>Max</Tag>
          </>
        ) : null}
        {meta.type === 'number' ? (
          <>
            <Tag color={aggregate === 'avg' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, transform, aggregate === 'avg' ? '' : 'avg')} style={{ cursor: 'pointer' }}>Avg</Tag>
            <Tag color={aggregate === 'sum' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setTransform(index, transform, aggregate === 'sum' ? '' : 'sum')} style={{ cursor: 'pointer' }}>Sum</Tag>
          </>
        ) : null}
      </div>
    )
  }

  renderFilter (meta) {
    const { filter, column } = this.props
    const { removeFiltersByKey, addEmptyFilter } = this.actions

    const filterInUse = filter.some(({ key, value }) => key === column)

    return (
      <div className='filter-options'>
        Filter:
        {' '}
        <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => addEmptyFilter(column)}>
          add
        </span>
        {filterInUse ? (
          <span>
            {' | '}
            <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => removeFiltersByKey(column)}>
              remove
            </span>
          </span>
        ) : null}
      </div>
    )
  }

  render () {
    const { column, columnsMeta, structure } = this.props

    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    const key = path.split('.')[path.split('.').length - 1]

    return (
      <div className='column-settings'>
        <div>
          <span style={{ textDecoration: 'underline', cursor: 'pointer', float: 'right', color: 'hsl(3, 77%, 42%)', marginLeft: 15 }} onClick={this.handleRemove}>
            <Icon type='delete' style={{ marginRight: 5 }} />
            Remove
          </span>
          <div style={{ fontWeight: 'bold' }}>
            {meta && meta.model ? `${meta.model}.${key}` : key}
          </div>
        </div>
        {meta ? (
          <div>
            {this.renderTransform(meta)}
            {this.renderAggregate(meta)}
            {this.renderFacets(meta)}
            {this.renderFilter(meta)}
          </div>
        ) : null}
      </div>
    )
  }
}

export default logic(TableHeader)
