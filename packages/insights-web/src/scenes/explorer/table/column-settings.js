import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import { Select, Tag, Icon } from 'antd'

import range from 'lib/utils/range'

import getMeta from 'lib/explorer/get-meta'
import { ColumnFilters } from 'scenes/explorer/filter/column-filters'

import explorerLogic from 'scenes/explorer/logic'
import { AggregateList } from '../sidebar/selected-model/aggregate'

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
      'facetsCount',
      'hasGraph'
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
    const { facetsColumn, column, facetsCount, hasGraph } = this.props
    const { setFacetsColumn, setFacetsCount } = this.actions

    if (meta.type !== 'string' && meta.type !== 'boolean') {
      return null
    }

    if (facetsColumn !== column && !hasGraph) {
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

  renderFilter () {
    const { filter, column } = this.props
    const { addEmptyFilter } = this.actions
    const [ path, ] = column.split('!')

    return (
      <div className='filter-options'>
        <ColumnFilters path={path} filter={filter}  onAddClick={() => addEmptyFilter(column)} filterPrefixString='column' />
      </div>
    )
  }

  render () {
    const { index, column, columnsMeta, structure } = this.props
    const { setTransform } = this.actions

    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    const localPath = path.replace(/^[^.]+\./, '').split('.').reverse().join(' < ')

    return (
      <div className='column-settings'>
        <div className='column-settings-header'>
          <div className='title'>
            {localPath}
          </div>
          <span className='remove'>
            <span onClick={this.handleRemove}>
              <Icon type='delete' style={{ marginRight: 5 }} />
              Remove
            </span>
          </span>
        </div>
        {meta ? (
          <div>
            {this.renderTransform(meta)}
            <AggregateList meta={meta} aggregate={aggregate} className='filter-options' setAggregate={value => setTransform(index, transform, aggregate === value ? '' : value)} />
            {this.renderFacets(meta)}
            {this.renderFilter(meta)}
          </div>
        ) : null}
      </div>
    )
  }
}

export default logic(TableHeader)
