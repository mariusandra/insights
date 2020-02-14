import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import moment from 'moment'

import { Popover, Icon, Button, Radio, Input, Tooltip, DatePicker, Tag } from 'antd'
import getMeta from 'lib/explorer/get-meta'

import explorerLogic from 'scenes/explorer/logic'

const sanitizeNumber = (str) => str.replace(/[^0-9.]/g, '')
const sanitizeListNumber = (str) => str.replace(/[^0-9., ]/g, '')

function RadioClick ({ value, setFilter, children }) {
  return (
    <Radio className='filter-radio-popup' value={value}>
      <span onClick={() => setFilter(value)} style={{ display: 'inline-block', width: '100%' }}>
        {children}
      </span>
    </Radio>
  )
}

function FilterTag ({ field, value, openFilter, removeFilter }) {
  const [fieldType, ...fieldValues] = (value || '').split(':')
  const fieldValue = fieldValues.join(':') || ''

  let iconTheme = 'filled'
  let filterText = `${fieldType} ${fieldValue}`

  if (fieldType === 'equals') {
    filterText = fieldValue
  }

  if (fieldType === 'date_range') {
    const [from, to] = fieldValue.split(':', 2)
    filterText = <span>{from} <Icon type='ellipsis' /> {to}</span>
  }

  if (fieldType !== 'true' && fieldType !== 'false' && fieldType !== 'null' && fieldType !== 'not null' && fieldValue === '') {
    if (fieldType === 'equals') {
      filterText = <span style={{ opacity: 0.5 }}>Empty String</span>
    } else {
      filterText = <span style={{opacity: 0.5}}>Anything</span>
      iconTheme = ''
    }
  }

  const [fieldName, mod1, mod2] = (field || '').split('!', 3)

  return (
    <Tag onClick={openFilter} onClose={removeFilter} visible closable={!!removeFilter} className='filter-tag'>
      <Icon type='filter' theme={iconTheme} style={{ marginRight: 5, color: 'hsl(209, 32%, 40%)' }} />
      <strong>{fieldName}{mod1 ? ` (${mod1})` : ''}{mod2 ? ` (${mod2})` : ''}:</strong> {filterText}
    </Tag>
  )
}

const logic = connect({
  actions: [
    explorerLogic, [
      'addFilter',
      'setFilter',
      'openTreeNodeFilter',
      'removeFilter'
    ]
  ],
  values: [
    explorerLogic, [
      'sort',
      'columnsMeta',
      'structure',
      'treeNodeFilterOpen'
    ]
  ]
})

class OneFilter extends Component {
  static propTypes = {
    index: PropTypes.number,
    value: PropTypes.string,
    column: PropTypes.string,
    placement: PropTypes.string,
    forceOpen: PropTypes.bool,
    onClose: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      filterValue: ''
    }
  }

  saveFilter = (value) => {
    const { index, column, forceOpen } = this.props
    const { setFilter, addFilter, removeFilter } = this.actions

    if (index === -1) {
      addFilter({ key: column, value })
    } else if (value === '' && forceOpen) {
      removeFilter(index)
    } else {
      setFilter(index, value)
    }
    this.handleVisibleChange(false)
  }

  setFilter = (value) => {
    if (value && value.indexOf(':') === -1 && this.state.filterValue.indexOf(value) === 0) {
      return
    }

    this.setState({ filterValue: value })
  }

  addAnotherFilter = () => {
    const { column } = this.props
    const { addFilter, openTreeNodeFilter } = this.actions

    const [ path, , ] = column.split('!')

    addFilter({ key: column, value: '' })
    openTreeNodeFilter(`...tree.X.${path}`)
  }

  renderBooleanFilter = (meta, fieldType, fieldValue) => {
    return (
      <>
        <RadioClick setFilter={this.setFilter} value='true'>
          True
        </RadioClick>
        <RadioClick setFilter={this.setFilter} value='false'>
          False
        </RadioClick>
      </>
    )
  }

  renderStringFilter = (meta, fieldType, fieldValue) => {
    return (
      <>
        <RadioClick setFilter={this.setFilter} value='equals'>
          Equals
          {fieldType === 'equals' ? (
            <Input
              autoFocus
              placeholder='Empty String'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `equals:${e.target.value}`)}
              style={{ width: 150, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='contains'>
          Contains
          {fieldType === 'contains' ? (
            <Input
              autoFocus
              placeholder='abc'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `contains:${e.target.value}`)}
              style={{ width: 150, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='in'>
          In list
          {fieldType === 'in' ? (
            <Input
              autoFocus
              placeholder='1, 2, 3'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `in:${e.target.value}`)}
              style={{ width: 150, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='not_in'>
          Not in list
          {fieldType === 'not_in' ? (
            <Input
              autoFocus
              placeholder='a, b, c'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `not_in:${e.target.value}`)}
              style={{ width: 150, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>
      </>
    )
  }

  renderNumberFilter = (meta, fieldType, fieldValue) => {
    return (
      <>
        <RadioClick setFilter={this.setFilter} value='equals'>
          Equals
          {fieldType === 'equals' ? (
            <Input
              autoFocus
              placeholder='123'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `equals:${sanitizeNumber(e.target.value)}`)}
              style={{ width: 100, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='in'>
          In list
          {fieldType === 'in' ? (
            <Input
              autoFocus
              placeholder='1, 2, 3'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `in:${sanitizeListNumber(e.target.value)}`)}
              style={{ width: 100, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='not_in'>
          Not in list
          {fieldType === 'not_in' ? (
            <Input
              autoFocus
              placeholder='a, b, c'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `not_in:${sanitizeListNumber(e.target.value)}`)}
              style={{ width: 100, marginLeft: 10 }}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='between'>
          Between
          {fieldType === 'between' ? (
            <>
              <Input
                autoFocus
                placeholder='- 999'
                value={fieldValue.split(':', 2)[0]}
                onChange={e => {
                  const str = `${sanitizeNumber(e.target.value || '')}:${fieldValue.split(':')[1] || ''}`
                  this.setFilter(str === ':' ? '' : `between:${str}`)
                }}
                style={{ width: 100, marginLeft: 10 }}
              />
              <Input
                placeholder='+ 999'
                value={fieldValue.split(':', 2)[1]}
                onChange={(e) => {
                  const str = `${fieldValue.split(':')[0] || ''}:${sanitizeNumber(e.target.value || '')}`
                  this.setFilter(str === ':' ? '' : `between:${str}`)
                }}
                style={{ width: 100, marginLeft: 10 }}
              />
            </>
          ) : null}
        </RadioClick>
      </>
    )
  }

  renderTimeFilter = (meta, fieldType, fieldValue) => {
    let equalsDate = null
    let startDate = null
    let endDate = null

    if (fieldType === 'date_range') {
      let [startStr, endStr] = fieldValue.split(':')
      if (startStr) {
        startDate = moment(startStr)
      }
      if (endStr) {
        endDate = moment(endStr)
      }
    }

    if (fieldType === 'equals') {
      if (fieldValue) {
        equalsDate = moment(fieldValue)
      }
    }

    return (
      <>
        <RadioClick setFilter={this.setFilter} value='equals'>
          Equals
          {fieldType === 'equals' ? (
            <DatePicker
              autoFocus
              value={equalsDate}
              style={{ width: 140, marginLeft: 10 }}
              onChange={(date, dateString) => this.setFilter(date ? `equals:${date.format('YYYY-MM-DD')}` : '')}
            />
          ) : null}
        </RadioClick>

        <RadioClick setFilter={this.setFilter} value='date_range'>
          Between
          {fieldType === 'date_range' ? (
            <DatePicker.RangePicker
              autoFocus
              value={[startDate, endDate]}
              style={{ width: 240, marginLeft: 10 }}
              onChange={([start, end]) => this.setFilter(start && end ? `date_range:${start.format('YYYY-MM-DD')}:${end.format('YYYY-MM-DD')}` : '')}
            />
          ) : null}
        </RadioClick>
      </>
    )
  }

  renderFilter = (meta) => {
    const { index, value, forceOpen } = this.props
    const { filterValue } = this.state

    const [fieldType, ...fieldValues] = (filterValue || value || '').split(':') || ''
    const fieldValue = fieldValues.join(':') || ''

    return (
      <div>
        <Radio.Group onChange={e => this.setFilter(e.target.value)} value={fieldType}>
          <RadioClick setFilter={this.setFilter} value=''>
            Anything
          </RadioClick>
          <RadioClick setFilter={this.setFilter} value='not null'>
            Present (not null)
          </RadioClick>
          <RadioClick setFilter={this.setFilter} value='null'>
            Empty (null)
          </RadioClick>

          {meta.type === 'boolean' ? this.renderBooleanFilter(meta, fieldType, fieldValue) : null}
          {meta.type === 'string' ? this.renderStringFilter(meta, fieldType, fieldValue) : null}
          {meta.type === 'number' ? this.renderNumberFilter(meta, fieldType, fieldValue) : null}
          {meta.type === 'time' || meta.type === 'date' ? this.renderTimeFilter(meta, fieldType, fieldValue) : null}
        </Radio.Group>

        <div style={{ marginTop: 20, marginBottom: 5 }}>
          {value !== '' && index >= 0 && forceOpen ? (
            <div style={{ float: 'right' }}>
              <Tooltip title='Add another filter'>
                <Button onClick={this.addAnotherFilter}>
                  <Icon type='plus' /><Icon type='filter' />
                </Button>
              </Tooltip>
            </div>
          ) : null}

          <Button type='primary' onClick={() => this.saveFilter(filterValue || value || '')} disabled={!filterValue || filterValue === value}>
            Save
          </Button>

          <Button type='link' onClick={() => { this.setState({ filterValue: null }); this.handleVisibleChange(false) }}>
            {filterValue && filterValue !== value ? 'Cancel' : 'Close'}
          </Button>
        </div>
      </div>
    )
  }

  handleVisibleChange = (visible) => {
    const { treeNodeFilterOpen } = this.props
    const { openTreeNodeFilter } = this.actions

    if (!visible) {
      if (treeNodeFilterOpen && treeNodeFilterOpen.indexOf('...tree.') === 0 && treeNodeFilterOpen.indexOf('...tree.X.') !== 0) {
        const path = treeNodeFilterOpen.substring('...tree.'.length).split('.').slice(1).join('.')
        openTreeNodeFilter(`...tree.X.${path}`)
      } else {
        openTreeNodeFilter('')
      }
    }
  }

  render () {
    const { index, column, value, columnsMeta, structure, placement, forceOpen, children, treeNodeFilterOpen, filterPrefix = '' } = this.props
    const { removeFilter, openTreeNodeFilter } = this.actions

    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    const localKey = column.split('.').slice(-1).join('.')

    const isOpen = forceOpen || treeNodeFilterOpen === `${filterPrefix || index}.${column}`

    const overlay = this.renderFilter(meta)
    const title = (
      <span className='insights-filter-title'>
        {index >= 0 ? (
          <Tooltip title='Remove filter'>
            <Button type='link' className='filter-popover-delete' onClick={() => { removeFilter(index); this.handleVisibleChange(false) }}>
              <Icon type='delete' />
            </Button>
          </Tooltip>
        ) : null}
        {path}
      </span>
    )

    return (
      <Popover
        key={`${index}.${column}`}
        content={overlay}
        title={title}
        trigger='click'
        placement={placement || 'bottomLeft'}
        visible={isOpen}
        onVisibleChange={this.handleVisibleChange}
      >
        <span>
          {children || <FilterTag
            field={localKey}
            value={value}
            openFilter={() => openTreeNodeFilter(`${filterPrefix || index}.${column}`)}
            removeFilter={index >= 0 ? () => { removeFilter(index) } : undefined}
          />}
        </span>
      </Popover>
    )
  }
}

export default logic(OneFilter)
