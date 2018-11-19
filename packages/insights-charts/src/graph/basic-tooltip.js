import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

const diffInPercentage = (oldValue, newValue) => {
  if (!oldValue && !newValue) {
    return <span style={{ color: 'gray' }}>0</span>
  } else if (!oldValue && newValue) {
    return <span style={{ color: 'green' }}>+∞</span>
  } else if (oldValue && !newValue) {
    return <span style={{ color: 'red' }}>-100%</span>
  } else if (oldValue > newValue) {
    return <span style={{ color: 'red' }}>-{Math.round((oldValue - newValue) / oldValue * 100)}%</span>
  } else if (oldValue < newValue) {
    return <span style={{ color: 'green' }}>+{Math.round((newValue - oldValue) / oldValue * 100)}%</span>
  } else {
    return <span style={{ color: 'gray' }}>0%</span>
  }
}

export default class BasicTooltip extends Component {
  static propTypes = {
    graph: PropTypes.object,
    controls: PropTypes.object
  }

  labelFormatter (time) {
    const { graph: { timeGroup } } = this.props

    if (timeGroup === 'year') {
      return moment(time).format('YYYY')
    } else if (timeGroup === 'quarter') {
      return 'Q' + moment(time).format('Q YYYY')
    } else if (timeGroup === 'month') {
      return moment(time).format('MMMM YYYY')
    } else if (timeGroup === 'week') {
      const firstDay = moment(time)
      const lastDay = moment(time).add(6, 'days')
      if (firstDay.month() === lastDay.month()) {
        return `${firstDay.format('DD')} - ${lastDay.format('DD MMMM YYYY')}`
      } else if (firstDay.year() === lastDay.year()) {
        return `${firstDay.format('DD MMMM')} - ${lastDay.format('DD MMMM YYYY')}`
      } else {
        return `${firstDay.format('DD MMMM YYYY')} - ${lastDay.format('DD MMMM YYYY')}`
      }
    } else {
      return moment(time).format('dddd, LL')
    }
  }

  render () {
    const { active, payload, label, graph, controls } = this.props
    const { timeGroup } = graph
    const { compareWith, percentages } = controls
    const facets = graph.facets && graph.facets.length > 0
    const unit = ''

    const showCompare = !!compareWith && compareWith !== 0 && compareWith !== '0'

    if (active) {
      const visiblePayload = payload.filter(item => item.dataKey.indexOf('__hidden') < 0).filter(i => i.dataKey.indexOf('compareWith::') < 0)
      const compareWithPayload = showCompare ? payload.filter(item => item.dataKey.indexOf('__hidden') < 0).filter(i => i.dataKey.indexOf('compareWith::') === 0) : []

      const total = visiblePayload.map(item => percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')] || 0) : item.value - 0).reduce((a, b) => a + b, 0)
      const totalPercentage = percentages ? visiblePayload.map(item => parseFloat(item.payload[item.dataKey])).reduce((a, b) => a + b, 0) : 100
      const percentageFrom = facets ? total : visiblePayload.map(p => p.value).reduce((a, b) => Math.max(a, b), 0)

      const localeStringOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

      let compareWithTotal
      let compareWithTotalPercentage
      let compareWithPercentageFrom

      if (showCompare) {
        compareWithTotal = compareWithPayload.map(item => percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')] || 0) : (item.value || 0) - 0).reduce((a, b) => a + b, 0)
        compareWithTotalPercentage = percentages ? compareWithPayload.map(item => parseFloat(item.payload[item.dataKey] || 0)).reduce((a, b) => a + b, 0) : 100
        compareWithPercentageFrom = facets ? compareWithTotal : compareWithPayload.map(p => p.value).reduce((a, b) => Math.max(a, b), 0)
      }

      return (
        <div className='recharts-default-tooltip' style={{background: 'white', border: '1px solid #ddd', padding: '10px', boxShadow: '1px 1px 3px rgba(0,0,0,0.24)'}}>
          <table>
            <thead>
              <tr>
                <th />
                {showCompare && (
                  <th>{this.labelFormatter(moment(label).subtract(compareWith, timeGroup))}</th>
                )}
                {showCompare && percentages && (
                  <th>%</th>
                )}
                <th>{this.labelFormatter(label)}</th>
                {percentages && (
                  <th>%</th>
                )}
                {showCompare && (
                  <th>Change %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {facets ? (
                <tr>
                  <td style={{paddingRight: 5, paddingBottom: 5}}>Total:</td>
                  {showCompare && (
                    <td style={{textAlign: 'right'}}>{compareWithTotal.toLocaleString('en', localeStringOptions)}{unit}</td>
                  )}
                  {showCompare && percentages && (
                    <td style={{textAlign: 'right'}}>{Math.round(compareWithTotalPercentage)}%</td>
                  )}

                  <td style={{textAlign: 'right'}}>{total.toLocaleString('en', localeStringOptions)}{unit}</td>
                  {percentages && (
                    <td style={{textAlign: 'right'}}>{Math.round(totalPercentage)}%</td>
                  )}

                  {showCompare && (
                    <td style={{textAlign: 'right'}}>{diffInPercentage(compareWithTotal, total)}</td>
                  )}
                </tr>
              ) : null}
              {visiblePayload.map(item => {
                const value = (percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')] || 0) : item.value - 0) || 0
                const displayValue = value.toLocaleString('en', localeStringOptions)
                const percentage = percentages ? item.payload[item.dataKey] : Math.round(value / percentageFrom * 100)

                let compareWithValue
                let compareWithDisplayValue
                let compareWithPercentage

                if (showCompare) {
                  const compareWithItem = compareWithPayload.filter(i => i.dataKey === `compareWith::${item.dataKey}`)[0]
                  if (compareWithItem) {
                    compareWithValue = (percentages ? parseFloat(compareWithItem.payload[compareWithItem.dataKey.replace('__%', '')] || 0) : compareWithItem.value - 0) || 0
                    compareWithDisplayValue = compareWithValue.toLocaleString('en', localeStringOptions)
                    compareWithPercentage = percentages ? item.payload[item.dataKey] : Math.round(compareWithValue / compareWithPercentageFrom * 100)
                  }
                }

                return (
                  <tr key={item.dataKey} className='recharts-tooltip-item' style={{color: item.color}}>
                    <td style={{paddingRight: 10}}>{item.name}:</td>
                    {showCompare && (
                      <td style={{textAlign: 'right'}}>{compareWithDisplayValue}{unit}</td>
                    )}
                    {showCompare && percentages && (
                      <td style={{textAlign: 'right'}}>{`${Math.round(compareWithPercentage)}%`}</td>
                    )}

                    <td style={{textAlign: 'right'}}>{displayValue}{unit}</td>
                    {percentages && (
                      <td style={{textAlign: 'right'}}>{`${Math.round(percentage)}%`}</td>
                    )}

                    {showCompare && (
                      <td style={{textAlign: 'right'}}>{diffInPercentage(compareWithValue, value)}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }
}
