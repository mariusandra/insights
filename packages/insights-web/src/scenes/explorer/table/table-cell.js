import React from 'react'

import moment from 'moment'

import { Icon } from 'antd'
import { Cell } from 'fixed-data-table-2'

export function columnToValue (column, meta, value) {
  if (value && meta && (meta.type === 'time' || meta.type === 'date') && (meta.transform || column.split('!')[1])) {
    const date = moment(value).startOf(meta.transform === 'week' ? 'isoWeek' : meta.transform || column.split('!')[1]).format('YYYY-MM-DD')
    return date
  } else {
    return value
  }
}

export function columnToFilter (column, meta, value) {
  return { key: column, value: `equals:${columnToValue(column, meta, value)}` }
}

export default (props) => {
  const { results, column, row, index, offset, meta, digDeeper, columnFilter, addFilter, removeFiltersByKey, ...cellProps } = props

  const rowColumns = results[row - offset]

  if (!rowColumns) {
    return (
      <Cell className='cell-body' {...cellProps}>
        ...
      </Cell>
    )
  }

  const value = rowColumns[index]

  let displayValue = value
  let className = ''
  let link = meta && meta.url ? meta.url.split(`{${meta.key}}`).join(value) : null

  if (value === true) {
    displayValue = 'true'
    className = 'boolean true'
  } else if (value === false) {
    displayValue = 'false'
    className = 'boolean false'
  }

  if (value && meta && (meta.type === 'time' || meta.type === 'date')) {
    if (meta.transform === 'week') {
      const endOfWeek = moment(value).add(6, 'days')
      displayValue = moment(value).format('YYYY-MM-DD') + ' - ' + endOfWeek.format('YYYY-MM-DD')
    } else if (meta.transform === 'day' || meta.transform === 'week' || (!meta.transform && meta.type === 'date')) {
      displayValue = moment(value).format('YYYY-MM-DD')
    } else if (meta.transform === 'quarter') {
      displayValue = 'Q' + moment(value).format('Q YYYY')
    } else if (meta.transform === 'month') {
      displayValue = moment(value).format('YYYY-MM')
    } else if (meta.transform === 'year') {
      displayValue = moment(value).format('YYYY')
    }
  }

  if (value === '') {
    displayValue = <span style={{ opacity: 0.5 }}>Empty String</span>
  } else if (value === null) {
    displayValue = <span style={{ opacity: 0.5 }}>NULL</span>
  } else if (value === undefined) {
    displayValue = <span style={{ opacity: 0.5 }}>undefined</span>
  }

  if (meta && meta.type === 'number') {
    if (typeof displayValue === 'string' && displayValue.indexOf('.') >= 0) {
      displayValue = <span title={displayValue} style={{ cursor: 'help' }}>{(Math.round(parseFloat(displayValue) * 100) / 100).toFixed(2)}</span>
    }
    displayValue = <div className='cell-number-display'>{displayValue}</div>
  }

  if (meta && meta.aggregate) {
    return (
      <Cell {...cellProps} className='cell-body'>
        <span className='aggregate-link' onClick={() => digDeeper(row - offset)}>{displayValue}</span>
      </Cell>
    )
  }

  const hasLocalFilter = columnFilter && `equals:${columnToValue(column, meta, value)}` === columnFilter.value

  return (
    <Cell {...cellProps} className='cell-body'>
      <div className='cell-body-flex'>
        <div className='cell-body-text'>
          {link
            ? <a href={link} target='_blank' rel="noopener noreferrer" className={className}>{displayValue}</a>
            : className
              ? <span className={className}>{displayValue}</span>
              : <>{displayValue}</>}
        </div>
        <div className='cell-body-tools'>
          <span className={`table-filter-icon${hasLocalFilter ? ' table-filter-icon-filled' : ''}`} onClick={() => hasLocalFilter ? removeFiltersByKey(column) : addFilter(columnToFilter(column, meta, value))}>
            <Icon type='filter' theme={hasLocalFilter ? 'filled' : ''} />
          </span>
        </div>
      </div>
    </Cell>
  )
}
