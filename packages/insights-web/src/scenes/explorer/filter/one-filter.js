import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import moment from 'moment'

import DateTime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

import { Popover, Icon, Button, Radio, Input, Tooltip } from 'antd'
import getMeta from 'lib/explorer/get-meta'

import explorerLogic from 'scenes/explorer/logic'

const sanitizeNumber = (str) => str.replace(/[^0-9.]/g, '')
const sanitizeListNumber = (str) => str.replace(/[^0-9., ]/g, '')

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

  renderBooleanFilter = (meta, columnFilter) => {
    return (
      <div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: columnFilter === 'equals:true' ? 'bold' : 'normal'}} onClick={() => this.setFilter('equals:true')}>True</span>
        </div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: columnFilter === 'equals:false' ? 'bold' : 'normal'}} onClick={() => this.setFilter('equals:false')}>False</span>
        </div>
      </div>
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
              value={fieldType === 'equals' ? fieldValue : ''}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `equals:${e.target.value}`)}
              style={{ width: 100, marginLeft: 10 }}
            />
          ) : null}
        </Radio>

        <Radio className='filter-radio-popup' value='contains'>
          Contains
          {fieldType === 'contains' ? (
            <Input
              autoFocus
              placeholder='abc'
              value={fieldType === 'contains' ? fieldValue : ''}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `contains:${e.target.value}`)}
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
              value={fieldType === 'in' ? fieldValue : ''}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `in:${e.target.value}`)}
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
              value={fieldType === 'not_in' ? fieldValue : ''}
              onChange={e => this.setFilter(e.target.value === '' ? '' : `not_in:${e.target.value}`)}
              style={{ width: 100, marginLeft: 10 }}
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
              value={fieldType === 'equals' ? fieldValue : ''}
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
              value={fieldType === 'in' ? fieldValue : ''}
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
              value={fieldType === 'not_in' ? fieldValue : ''}
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

  renderTimeFilter = (meta, columnFilter) => {
    let equalsDate = null
    let startDate = null
    let endDate = null

    if (columnFilter && columnFilter.indexOf('date_range:') === 0) {
      let [, startStr, endStr] = columnFilter.split(':')
      if (startStr) {
        startDate = moment(startStr)
      }
      if (endStr) {
        endDate = moment(endStr)
      }
    }

    if (columnFilter && columnFilter.indexOf('equals:') === 0) {
      let [, equalsStr] = columnFilter.split(':')
      if (equalsStr) {
        equalsDate = moment(equalsStr)
      }
    }

    return (
      <div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('equals:') === 0 ? 'bold' : 'normal'}}>Equals:</span>
          <DateTime value={equalsDate}
            dateFormat='YYYY-MM-DD'
            timeFormat={false}
            className='full'
            closeOnSelect
            onChange={(date) => this.setFilter(date ? `equals:${date.format('YYYY-MM-DD')}` : '')} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('date_range:') === 0 ? 'bold' : 'normal'}}>Between:</span>
          <DateTime value={startDate}
            dateFormat='YYYY-MM-DD'
            timeFormat={false}
            className='half'
            closeOnSelect
            onChange={(date) => {
              const str = `${date ? date.format('YYYY-MM-DD') : ''}:${endDate ? endDate.format('YYYY-MM-DD') : ''}`
              this.setFilter(str === ':' ? '' : `date_range:${str}`)
            }} />
          <DateTime value={endDate}
            dateFormat='YYYY-MM-DD'
            timeFormat={false}
            className='half'
            closeOnSelect
            onChange={(date) => {
              const str = `${startDate ? startDate.format('YYYY-MM-DD') : ''}:${date ? date.format('YYYY-MM-DD') : ''}`
              this.setFilter(str === ':' ? '' : `date_range:${str}`)
            }} />
        </div>
      </div>
    )
  }

  renderFilter = (meta) => {
    const { index, value, forceOpen } = this.props
    const columnFilter = value

    const [fieldType, ...fieldValues] = (columnFilter || '').split(':')
    const fieldValue = fieldValues.join(':') || ''

    console.log(fieldType, fieldValue)

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

        {meta.type === 'boolean' ? this.renderBooleanFilter(meta, columnFilter) : null}
        {meta.type === 'string' ? this.renderStringFilter(meta, fieldType, fieldValue) : null}
        {meta.type === 'number' ? this.renderNumberFilter(meta, fieldType, fieldValue) : null}
        {meta.type === 'time' || meta.type === 'date' ? this.renderTimeFilter(meta, columnFilter) : null}
        {value !== '' && index >= 0 && forceOpen ? (
          <div
            onClick={this.addAnotherFilter}
            style={{paddingTop: 10, marginTop: 10, borderTop: '1px solid green', cursor: 'pointer', color: 'green'}}>
            Add another filter
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
          <span>
            {index >= 0 && !forceOpen ? (
              <Tooltip title='Remove filter'>
                <Button type='link' className='filter-popover-delete' onClick={() => removeFilter(index)}>
                  <Icon type='delete' />
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
        {children || (
          <span className='filter-preview-element'>
            {localKey}: {value.replace('equals:', '')}
          </span>
        )}
      </Popover>
    )
  }
}

export default logic(OneFilter)
