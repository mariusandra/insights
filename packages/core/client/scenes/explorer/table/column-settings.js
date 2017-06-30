import React, { Component, PropTypes } from 'react'
import { connect } from 'kea/logic'

import 'react-datetime/css/react-datetime.css'

import getMeta from 'lib/explorer/get-meta'

import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'setSort',
      'addColumn',
      'removeColumnWithIndex',
      'addEmptyFilter',
      'removeFiltersByKey',
      'setTransform',
      'setFacetsColumn'
    ]
  ],
  props: [
    explorerLogic, [
      'sort',
      'filter',
      'columnsMeta',
      'structure',
      'facetsColumn'
    ]
  ]
})
export default class TableHeader extends Component {
  static propTypes = {
    index: PropTypes.number,
    column: PropTypes.string
  }

  handleSort = () => {
    const { sort, column } = this.props
    const { setSort } = this.props.actions

    if (sort === column) {
      setSort(`-${column}`)
    } else {
      setSort(column)
    }
  }

  handleAdd = () => {
    const { column } = this.props
    const { addColumn } = this.props.actions

    addColumn(column)
  }

  handleRemove = () => {
    const { index } = this.props
    const { removeColumnWithIndex } = this.props.actions

    removeColumnWithIndex(index)
  }

  renderSort = () => {
    const { column, sort } = this.props

    const isSorted = sort === column || sort === `-${column}`
    const descending = sort === `-${column}`

    return (
      <div>
        {'Sort: '}
        <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={this.handleSort}>
          {isSorted ? (descending ? 'descending' : 'ascending') : 'off'}
        </span>
      </div>
    )
  }

  renderTransform (meta) {
    const { index, column } = this.props
    const { setTransform } = this.props.actions

    const [ , transform, aggregate ] = column.split('!')

    if (meta.type !== 'time' && meta.type !== 'date') {
      return <div />
    }

    return (
      <div className='filter-options'>
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: !transform ? 'bold' : 'normal'}}
          onClick={() => setTransform(index, '', aggregate)}>{meta.type === 'date' ? 'Day' : 'Time'}</span>
        {' '}
        {meta.type === 'time' ? (
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: transform === 'day' ? 'bold' : 'normal'}}
            onClick={() => setTransform(index, 'day', aggregate)}>Day</span>
        ) : null}
        {meta.type === 'time' ? ' ' : ''}
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: transform === 'week' ? 'bold' : 'normal'}}
          onClick={() => setTransform(index, 'week', aggregate)}>Week</span>
        {' '}
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: transform === 'month' ? 'bold' : 'normal'}}
          onClick={() => setTransform(index, 'month', aggregate)}>Month</span>
        {' '}
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: transform === 'quarter' ? 'bold' : 'normal'}}
          onClick={() => setTransform(index, 'quarter', aggregate)}>Quarter</span>
        {' '}
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: transform === 'year' ? 'bold' : 'normal'}}
          onClick={() => setTransform(index, 'year', aggregate)}>Year</span>
      </div>
    )
  }

  renderFacets (meta) {
    const { facetsColumn, column } = this.props
    const { setFacetsColumn } = this.props.actions

    if (meta.type !== 'string' && meta.type !== 'boolean') {
      return null
    }

    return (
      <div className='filter-options'>
        <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: facetsColumn === column ? 'bold' : 'normal'}}
          onClick={() => setFacetsColumn(facetsColumn === column ? null : column)}>Facet by this column</span>
      </div>
    )
  }

  renderAggregate (meta) {
    const { index, column } = this.props
    const { setTransform } = this.props.actions

    const [ , transform, aggregate ] = column.split('!')

    if (meta.index !== 'primary_key' && meta.type !== 'string' && meta.type !== 'number') {
      return null
    }

    return (
      <div className='filter-options'>
        {meta.index === 'primary_key' ? (
          <span>
            <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: aggregate === 'count' ? 'bold' : 'normal'}}
              onClick={() => setTransform(index, transform, aggregate === 'count' ? '' : 'count')}>Count</span>
            {' '}
          </span>
        ) : null}
        {meta.type === 'string' || meta.type === 'number' ? (
          <span>
            <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: aggregate === 'min' ? 'bold' : 'normal'}}
              onClick={() => setTransform(index, transform, aggregate === 'min' ? '' : 'min')}>Min</span>
            {' '}
            <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: aggregate === 'max' ? 'bold' : 'normal'}}
              onClick={() => setTransform(index, transform, aggregate === 'max' ? '' : 'max')}>Max</span>
            {' '}
          </span>
        ) : null}
        {meta.type === 'number' ? (
          <span>
            <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: aggregate === 'avg' ? 'bold' : 'normal'}}
              onClick={() => setTransform(index, transform, aggregate === 'avg' ? '' : 'avg')}>Avg</span>
            {' '}
            <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: aggregate === 'sum' ? 'bold' : 'normal'}}
              onClick={() => setTransform(index, transform, aggregate === 'sum' ? '' : 'sum')}>Sum</span>
          </span>
        ) : null}
      </div>
    )
  }

  renderFilter (meta) {
    const { filter, column } = this.props
    const { removeFiltersByKey, addEmptyFilter } = this.props.actions

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
        <div style={{fontWeight: 'bold'}}>
          {meta && meta.model ? `${meta.model}.` : ''}
          {key}
        </div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={this.handleRemove}>
            Remove
          </span>
          {' - '}
          <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={this.handleAdd}>
            Clone
          </span>
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
