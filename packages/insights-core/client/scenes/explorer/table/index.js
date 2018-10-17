// libraries
import React, { Component } from 'react'
import { connect } from 'kea'

import { Table, Column, Cell } from 'fixed-data-table-2'

import 'fixed-data-table-2/dist/fixed-data-table-base.css'
import './styles.scss'

import Dimensions from 'react-dimensions'

// utils

// components
import TableCell from './table-cell'
import TableHeader from './table-header'
import TableSettings from './table-settings'

// logic
import explorerLogic from '~/scenes/explorer/logic'

const defaultColumnWidth = (meta) => {
  if (meta) {
    if (meta.type === 'boolean') {
      return 50
    } else if (meta.type === 'time') {
      if (meta.transform) {
        return 75
      } else {
        return 175
      }
    } else if (meta.type === 'number') {
      return 75
    } else {
      return 100
    }
  } else {
    return 100
  }
}

@connect({
  actions: [
    explorerLogic, [
      'setPagination',
      'setVisibleRows',
      'setColumnWidth',
      'setColumns',
      'digDeeper'
    ]
  ],
  props: [
    explorerLogic, [
      'columns',
      'columnsMeta',
      'results',
      'count',
      'offset',
      'limit',
      'columnWidths',
      'scrollingResetCounter'
    ]
  ]
})
@Dimensions({ elementResize: true })
export default class ExplorerTable extends Component {
  constructor (props) {
    super(props)
    this.state = { scrollToRow: null }
  }

  componentDidMount () {
    this.handleScrollEnd(0, 0)
  }

  componentWillUpdate (nextProps) {
    if (nextProps.scrollingResetCounter !== this.props.scrollingResetCounter) {
      this.setState({ scrollToRow: 0 })
      this.updateVisibleRows(nextProps, 0)
    }
  }

  handleScrollEnd = (x, y) => {
    this.setState({ scrollToRow: null })
    this.updateVisibleRows(this.props, y)
  }

  handleColumnReorder = (event) => {
    const { columns } = this.props
    const { setColumns } = this.props.actions

    let columnOrder = columns.filter((columnKey) => columnKey !== event.reorderColumn)

    if (event.columnAfter) {
      var index = columnOrder.indexOf(event.columnAfter)
      columnOrder.splice(index, 0, event.reorderColumn)
    } else {
      columnOrder.push(event.reorderColumn)
    }

    setColumns(columnOrder)
  }

  updateVisibleRows = (props, y) => {
    const { count } = props
    const { setPagination, setVisibleRows } = this.props.actions

    const tableHeight = this.tableHeight()

    if (tableHeight > 0) {
      const start = Math.floor(y / 30)
      const end = Math.floor((y + tableHeight) / 30)
      const pageCount = end - start

      if (pageCount > 0) {
        setVisibleRows(start + 1, Math.min(end, count))
        setPagination(Math.max(start - pageCount, 0), pageCount * 3)
      }
    }
  }

  tableHeight = () => {
    const { containerHeight } = this.props
    return containerHeight - 10
  }

  render () {
    const { columnWidths, columns, columnsMeta, results, count, offset, containerWidth } = this.props
    const { setColumnWidth, digDeeper } = this.props.actions
    const { scrollToRow } = this.state

    if (columns.length === 0) {
      return null
    }

    let i = 0

    return (
      <div className='results-explorer-table'>
        <Table rowsCount={count}
          rowHeight={30}
          headerHeight={30}
          width={containerWidth - 20}
          height={this.tableHeight()}
          scrollToRow={scrollToRow}
          isColumnResizing={false}
          isColumnReordering={false}
          onColumnResizeEndCallback={setColumnWidth}
          onColumnReorderEndCallback={this.handleColumnReorder}
          onScrollStart={this.handleScrollStart}
          onScrollEnd={this.handleScrollEnd} >
          <Column header={<Cell><TableSettings /></Cell>}
            cell={props => (
              <Cell {...props}>
                <div className='cell-body'>
                  {props.rowIndex + 1}.
                </div>
              </Cell>
            )}
            fixed
            width={Math.max(`${count}`.length * 10 + 18, 30)} />
          {columns.map(s => [s, columnsMeta[s], i++]).map(([column, meta, i]) => (
            <Column key={column}
              header={<Cell><TableHeader index={i} column={column} /></Cell>}
              columnKey={column}
              isResizable
              isReorderable
              cell={props => (
                <TableCell results={results}
                  row={props.rowIndex}
                  index={i}
                  offset={offset}
                  meta={meta}
                  digDeeper={digDeeper} />
              )}
              width={columnWidths[column] || defaultColumnWidth(meta)}
              flexGrow={typeof columnWidths[column] === 'undefined' ? 1 : null} />
          ))}
        </Table>
      </div>
    )
  }
}
