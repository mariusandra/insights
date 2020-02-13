import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import moment from 'moment'

import { Popover, Icon, Button, Radio, Input, Tooltip, DatePicker, Tag } from 'antd'
import getMeta from 'lib/explorer/get-meta'

import explorerLogic from 'scenes/explorer/logic'

const sanitizeNumber = (str) => str.replace(/[^0-9.]/g, '')
const sanitizeListNumber = (str) => str.replace(/[^0-9., ]/g, '')

function filterTag ({ field, value }) {
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
    filterText = <span style={{ opacity: 0.5 }}>Anything</span>
    iconTheme = ''
  }

  const [fieldName, mod1, mod2] = (field || '').split('!', 3)

  return (
    <Tag>
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
      'removeFilter'
    ]
  ],
  props: [
    explorerLogic, [
      'sort',
      'columnsMeta',
      'structure'
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

  setFilter = (value) => {
    const { index, column, forceOpen } = this.props
    const { setFilter, addFilter, removeFilter } = this.actions

    if (index === -1) {
      addFilter({ key: column, value })
    } else if (value === '' && forceOpen) {
      removeFilter(index)
    } else {
      setFilter(index, value)
    }
  }

  addAnotherFilter = () => {
    const { column } = this.props
    const { addFilter } = this.actions

    addFilter({ key: column, value: '' })
  }

  renderBooleanFilter = (meta, fieldType, fieldValue) => {
    return (
      <>
        <Radio className='filter-radio-popup' value='true'>
          True
        </Radio>
        <Radio className='filter-radio-popup' value='false'>
          False
        </Radio>
      </>
    )
  }

  renderStringFilter = (meta, fieldType, fieldValue) => {
    return (
      <>
        <Radio className='filter-radio-popup' value='equals'>
          Equals
          {fieldType === 'equals' ? (
            <Input
              autoFocus
              placeholder='abc'
              value={fieldValue}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `equals:${e.target.value}`)}
              style={{ width: 150, marginLeft: 10 }}
            />
          ) : null}
        </Radio>

        <Radio className='filter-radio-popup' value='contains'>
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
        </Radio>

        <Radio className='filter-radio-popup' value='in'>
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
        </Radio>

        <Radio className='filter-radio-popup' value='not_in'>
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
        </Radio>
      </>
    )
  }

  renderNumberFilter = (meta, fieldType, fieldValue) => {
    return (
      <>
        <Radio className='filter-radio-popup' value='equals'>
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
        </Radio>

        <Radio className='filter-radio-popup' value='in'>
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
        </Radio>

        <Radio className='filter-radio-popup' value='not_in'>
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
        </Radio>

        <Radio className='filter-radio-popup' value='between'>
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
        </Radio>
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
      console.log(startDate, endDate)
    }

    if (fieldType === 'equals') {
      if (fieldValue) {
        equalsDate = moment(fieldValue)
      }
    }

    return (
      <>
        <Radio className='filter-radio-popup' value='equals'>
          Equals
          {fieldType === 'equals' ? (
            <DatePicker
              autoFocus
              value={equalsDate}
              style={{ width: 140, marginLeft: 10 }}
              onChange={(date, dateString) => this.setFilter(date ? `equals:${date.format('YYYY-MM-DD')}` : '')}
            />
          ) : null}
        </Radio>

        <Radio className='filter-radio-popup' value='date_range'>
          Between
          {fieldType === 'date_range' ? (
            <div>
              <DatePicker.RangePicker
                autoFocus
                value={[startDate, endDate]}
                style={{ width: 240, marginLeft: 25 }}
                onChange={([start, end]) => this.setFilter(start && end ? `date_range:${start.format('YYYY-MM-DD')}:${end.format('YYYY-MM-DD')}` : '')}
              />
            </div>
          ) : null}
        </Radio>
      </>
    )
  }

  renderFilter = (meta) => {
    const { index, value, forceOpen } = this.props
    const columnFilter = value

    const [fieldType, ...fieldValues] = (columnFilter || '').split(':')
    const fieldValue = fieldValues.join(':') || ''

    return (
      <Radio.Group onChange={e => this.setFilter(e.target.value)} value={fieldType}>
        <Radio className='filter-radio-popup' value=''>
          Anything
        </Radio>
        <Radio className='filter-radio-popup' value='not null'>
          Present (not null)
        </Radio>
        <Radio className='filter-radio-popup' value='null'>
          Empty (null)
        </Radio>

        {meta.type === 'boolean' ? this.renderBooleanFilter(meta, fieldType, fieldValue) : null}
        {meta.type === 'string' ? this.renderStringFilter(meta, fieldType, fieldValue) : null}
        {meta.type === 'number' ? this.renderNumberFilter(meta, fieldType, fieldValue) : null}
        {meta.type === 'time' || meta.type === 'date' ? this.renderTimeFilter(meta, fieldType, fieldValue) : null}
        {value !== '' && index >= 0 && forceOpen ? (
          <div style={{ marginTop: 20 }}>
            <Button onClick={this.addAnotherFilter}>
              <Icon type='plus' /> Add another filter
            </Button>
          </div>
        ) : null}
      </Radio.Group>
    )
  }

  render () {
    const { index, column, value, columnsMeta, structure, placement, forceOpen, children } = this.props
    const { removeFilter } = this.actions

    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    const localKey = column.split('.').slice(-1).join('.')

    const overlay = this.renderFilter(meta)

    return (
      <Popover
        content={overlay}
        title={
          <span className='insights-filter-title'>
            {index >= 0 && !forceOpen ? (
              <Tooltip title='Remove filter'>
                <Button type='link' className='filter-popover-delete' onClick={() => removeFilter(index)}>
                  <Icon type='close' />
                </Button>
              </Tooltip>
            ) : null}
            {path}
          </span>
        }
        trigger='hover'
        placement={placement || 'bottomLeft'}
        {...(forceOpen ? { visible: true } : {})}
      >
        {children || filterTag({ field: localKey, value: value })}
      </Popover>
    )
  }
}

export default logic(OneFilter)
