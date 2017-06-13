import React, { Component, PropTypes } from 'react'
import { connect } from 'kea/logic'
import moment from 'moment'

import DateTime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

import Tooltip from 'rc-tooltip'
import getMeta from 'lib/explorer/get-meta'

import explorerLogic from '~/scenes/explorer/logic'

const sanitizeNumber = (str) => str.replace(/[^0-9.]/g, '')
const sanitizeListNumber = (str) => str.replace(/[^0-9., ]/g, '')

@connect({
  actions: [
    explorerLogic, [
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
export default class OneFilter extends Component {
  static propTypes = {
    index: PropTypes.number,
    value: PropTypes.string,
    column: PropTypes.string
  }

  renderBooleanFilter = (meta, columnFilter) => {
    const { index } = this.props
    const { setFilter } = this.props.actions

    return (
      <div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: columnFilter === 'equals:true' ? 'bold' : 'normal'}} onClick={() => setFilter(index, 'equals:true')}>True</span>
        </div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: columnFilter === 'equals:false' ? 'bold' : 'normal'}} onClick={() => setFilter(index, 'equals:false')}>False</span>
        </div>
      </div>
    )
  }

  renderStringFilter = (meta, columnFilter) => {
    const { index } = this.props
    const { setFilter } = this.props.actions

    return (
      <div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('equals:') === 0 ? 'bold' : 'normal'}}>Equals:</span>
          <input type='text' value={columnFilter && columnFilter.indexOf('equals:') === 0 ? columnFilter.substring(7) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `equals:${e.target.value}`)} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('contains:') === 0 ? 'bold' : 'normal'}}>Contains:</span>
          <input type='text' value={columnFilter && columnFilter.indexOf('contains:') === 0 ? columnFilter.substring(9) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `contains:${e.target.value}`)} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('in:') === 0 ? 'bold' : 'normal'}}>In list:</span>
          <input type='text' placeholder='1, 2, 3' value={columnFilter && columnFilter.indexOf('in:') === 0 ? columnFilter.substring(3) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `in:${e.target.value}`)} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('not_in:') === 0 ? 'bold' : 'normal'}}>Not in:</span>
          <input type='text' placeholder='a, b, c' value={columnFilter && columnFilter.indexOf('not_in:') === 0 ? columnFilter.substring(7) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `not_in:${e.target.value}`)} />
        </div>
      </div>
    )
  }

  renderNumberFilter = (meta, columnFilter) => {
    const { index } = this.props
    const { setFilter } = this.props.actions

    return (
      <div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('equals:') === 0 ? 'bold' : 'normal'}}>Equals:</span>
          <input type='text' placeholder='123' value={columnFilter && columnFilter.indexOf('equals:') === 0 ? columnFilter.substring(7) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `equals:${sanitizeNumber(e.target.value)}`)} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('in:') === 0 ? 'bold' : 'normal'}}>In list:</span>
          <input type='text' placeholder='1, 2, 3' value={columnFilter && columnFilter.indexOf('in:') === 0 ? columnFilter.substring(3) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `in:${sanitizeListNumber(e.target.value)}`)} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('not_in:') === 0 ? 'bold' : 'normal'}}>Not in:</span>
          <input type='text' placeholder='a, b, c' value={columnFilter && columnFilter.indexOf('not_in:') === 0 ? columnFilter.substring(7) : ''} onChange={(e) => setFilter(index, e.target.value === '' ? '' : `not_in:${sanitizeListNumber(e.target.value)}`)} />
        </div>
        <div className='filter-with-inputs'>
          <span style={{fontWeight: columnFilter && columnFilter.indexOf('between:') === 0 ? 'bold' : 'normal'}}>Between:</span>
          <input className='half'
                 placeholder='- ∞'
                 type='text'
                 value={columnFilter && columnFilter.indexOf('between:') === 0 ? columnFilter.split(':')[1] : ''}
                 onChange={(e) => {
                   const str = `${sanitizeNumber(e.target.value || '')}:${(columnFilter || '').split(':')[2] || ''}`
                   setFilter(index, str === ':' ? '' : `between:${str}`)
                 }} />
          <input className='half'
                 placeholder='+ ∞'
                 type='text'
                 value={columnFilter && columnFilter.indexOf('between:') === 0 ? columnFilter.split(':')[2] : ''}
                 onChange={(e) => {
                   const str = `${(columnFilter || '').split(':')[1] || ''}:${sanitizeNumber(e.target.value || '')}`
                   setFilter(index, str === ':' ? '' : `between:${str}`)
                 }} />
        </div>
      </div>
    )
  }

  renderTimeFilter = (meta, columnFilter) => {
    const { index } = this.props
    const { setFilter } = this.props.actions

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
                    onChange={(date) => setFilter(index, date ? `equals:${date.format('YYYY-MM-DD')}` : '')} />
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
                      setFilter(index, str === ':' ? '' : `date_range:${str}`)
                    }} />
          <DateTime value={endDate}
                    dateFormat='YYYY-MM-DD'
                    timeFormat={false}
                    className='half'
                    closeOnSelect
                    onChange={(date) => {
                      const str = `${startDate ? startDate.format('YYYY-MM-DD') : ''}:${date ? date.format('YYYY-MM-DD') : ''}`
                      setFilter(index, str === ':' ? '' : `date_range:${str}`)
                    }} />
        </div>
      </div>
    )
  }

  renderFilter = (meta) => {
    const { index, value } = this.props
    const { setFilter, removeFilter } = this.props.actions

    const columnFilter = value

    return (
      <div className='filter-options' style={{minWidth: 100}}>
        <span style={{float: 'right', cursor: 'pointer', color: 'red', fontWeight: 'bold'}} onClick={() => removeFilter(index)}>X</span>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: !columnFilter ? 'bold' : 'normal'}} onClick={() => setFilter(index, '')}>Anything</span>
        </div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: columnFilter === 'not null' ? 'bold' : 'normal'}} onClick={() => setFilter(index, 'not null')}>Present</span>
        </div>
        <div>
          <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: columnFilter === 'null' ? 'bold' : 'normal'}} onClick={() => setFilter(index, 'null')}>Empty</span>
        </div>
        {meta.type === 'boolean' ? this.renderBooleanFilter(meta, columnFilter) : null}
        {meta.type === 'string' ? this.renderStringFilter(meta, columnFilter) : null}
        {meta.type === 'number' ? this.renderNumberFilter(meta, columnFilter) : null}
        {meta.type === 'time' ? this.renderTimeFilter(meta, columnFilter) : null}
      </div>
    )
  }

  render () {
    const { column, value, columnsMeta, structure } = this.props

    const [ path, transform, aggregate ] = column.split('!')
    const meta = columnsMeta[column] || { ...getMeta(path, structure), transform, aggregate }

    const localKey = column.split('.').slice(-1).join('.')

    const overlay = this.renderFilter(meta)

    return (
      <Tooltip placement='bottomLeft' trigger={['hover']} overlay={overlay} onVisibleChange={this.handleTooltip}>
        <span className='preview-part'>
          {localKey}: {value.replace('equals:', '')}
        </span>
      </Tooltip>
    )
  }
}
