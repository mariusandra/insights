import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

const diffInPercentage = (oldValue, newValue) => {
  if (!oldValue && !newValue) {
    return <span style={{ color: 'gray' }}>0</span>
  } else if (!oldValue && newValue) {
    return <span style={{ color: 'green' }}>+∞%</span>
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

const diffInCount = (oldValue, newValue, localeStringOptions) => {
  if ((!oldValue && !newValue) || oldValue === newValue) {
    return <span style={{ color: 'gray' }}>0</span>
  } else if (oldValue < newValue) {
    return <span style={{ color: 'green' }}>+{Math.round(newValue - oldValue).toLocaleString('en', localeStringOptions)}</span>
  } else if (oldValue > newValue) {
    return <span style={{ color: 'red' }}>-{Math.round(oldValue - newValue).toLocaleString('en', localeStringOptions)}</span>
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
    const { timeGroup, keys } = graph
    const { compareWith, percentages, prediction } = controls
    const facets = graph.facets && graph.facets.length > 0
    const unit = ''

    const time = moment(label).format('YYYY-MM-DD')
    const showPercentages = percentages && facets
    const showCompare = !!compareWith && compareWith !== 0 && compareWith !== '0'
    const showPrediction = prediction && moment().startOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).format('YYYY-MM-DD') === time

    if (active && payload) {
      const visiblePayload = payload.filter(item => item.dataKey.indexOf('__hidden') < 0).filter(i => i.dataKey.indexOf('compareWith:') < 0)
      const compareWithPayload = showCompare ? payload.filter(item => item.dataKey.indexOf('__hidden') < 0).filter(i => i.dataKey.indexOf('compareWith::') === 0) : []

      const total = visiblePayload.map(item => percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')] || 0) : item.value - 0).reduce((a, b) => a + b, 0)
      const totalPercentage = percentages ? visiblePayload.map(item => parseFloat(item.payload[item.dataKey])).reduce((a, b) => a + b, 0) : 100
      const percentageFrom = facets ? total : visiblePayload.map(p => p.value).reduce((a, b) => Math.max(a, b), 0)

      const visibleValues = visiblePayload.map(item => percentages ? item.payload[item.dataKey.replace('__%', '')] : item.value)
      const compareWithValues = compareWithPayload.map(item => percentages ? item.payload[item.dataKey.replace('__%', '')] : item.value)

      const showFloat = visibleValues.concat(compareWithValues).some(v => v && v.toString().includes('.') && !v.toString().match(/\.0+$/))

      const localeStringOptions = { minimumFractionDigits: showFloat ? 2 : 0, maximumFractionDigits: showFloat ? 2 : 0 }

      let compareWithTotal
      let compareWithTotalPercentage
      let compareWithPercentageFrom

      if (showCompare) {
        compareWithTotal = compareWithPayload.map(item => percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')] || 0) : (item.value || 0) - 0).reduce((a, b) => a + b, 0)
        compareWithTotalPercentage = percentages ? compareWithPayload.map(item => parseFloat(item.payload[item.dataKey] || 0)).reduce((a, b) => a + b, 0) : 100
        compareWithPercentageFrom = facets ? compareWithTotal : compareWithPayload.map(p => p.value).reduce((a, b) => Math.max(a, b), 0)
      }

      const fullTime = showPrediction ? moment().endOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).unix() - moment().startOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).unix() : 1
      const elapsedTime = showPrediction ? moment().unix() - moment().startOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).unix() : 1
      const elapsedRatio = fullTime > 0 && elapsedTime > 0 ? elapsedTime / fullTime : 1

      return (
        <div className='recharts-default-tooltip' style={{background: 'white', border: '1px solid #ddd', padding: '10px', boxShadow: '1px 1px 3px rgba(0,0,0,0.24)'}}>
          <table>
            <thead>
              <tr>
                <th />
                {showCompare && (
                  <th>{this.labelFormatter(moment(label).subtract(compareWith, timeGroup))}</th>
                )}
                {showCompare && showPercentages && (
                  <th>%</th>
                )}
                <th>{this.labelFormatter(label)}</th>
                {showPercentages && (
                  <th>%</th>
                )}
                {showCompare && (
                  <th>Δ</th>
                )}
                {showCompare && (
                  <th>Δ %</th>
                )}
                {showPrediction && (
                  <th>Prediction</th>
                )}
                {showPrediction && showCompare && (
                  <th>Δ</th>
                )}
                {showPrediction && showCompare && (
                  <th>Δ %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {facets ? (
                <tr>
                  <td style={{paddingRight: 5, paddingBottom: 5}}>Total:</td>
                  {showCompare && <td style={{textAlign: 'right'}}>{compareWithTotal.toLocaleString('en', localeStringOptions)}{unit}</td>}
                  {showCompare && showPercentages && <td style={{textAlign: 'right'}}>{Math.round(compareWithTotalPercentage)}%</td>}

                  <td style={{textAlign: 'right'}}>{total.toLocaleString('en', localeStringOptions)}{unit}</td>
                  {showPercentages && <td style={{textAlign: 'right'}}>{Math.round(totalPercentage)}%</td>}

                  {showCompare && <td style={{textAlign: 'right'}}>{diffInCount(compareWithTotal, total, localeStringOptions)}</td>}
                  {showCompare && <td style={{textAlign: 'right'}}>{diffInPercentage(compareWithTotal, total)}</td>}

                  {showPrediction && <td style={{textAlign: 'right'}}>{(total / elapsedRatio).toLocaleString('en', localeStringOptions)}{unit}</td>}
                  {showPrediction && showCompare && <td style={{textAlign: 'right'}}>{diffInCount(compareWithTotal, (total / elapsedRatio), localeStringOptions)}</td>}
                  {showPrediction && showCompare && <td style={{textAlign: 'right'}}>{diffInPercentage(compareWithTotal, (total / elapsedRatio))}</td>}
                </tr>
              ) : null}
              {visiblePayload.map(item => {
                const value = (percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')] || 0) : item.value - 0) || 0
                const displayValue = value.toLocaleString('en', localeStringOptions)
                const percentage = percentages ? item.payload[item.dataKey] || 0 : Math.round(value / percentageFrom * 100)

                let compareWithValue
                let compareWithDisplayValue
                let compareWithPercentage

                let predictionValue
                let predictionDisplayValue

                if (showCompare) {
                  const compareWithItem = compareWithPayload.filter(i => i.dataKey === `compareWith::${item.dataKey}`)[0]
                  if (compareWithItem) {
                    compareWithValue = (percentages ? parseFloat(compareWithItem.payload[compareWithItem.dataKey.replace('__%', '')] || 0) : compareWithItem.value - 0) || 0
                    compareWithDisplayValue = compareWithValue.toLocaleString('en', localeStringOptions)
                    compareWithPercentage = percentages ? compareWithItem.payload[compareWithItem.dataKey] : compareWithValue ? Math.round(compareWithValue / compareWithPercentageFrom * 100) : 0
                  }
                }

                if (showPrediction) {
                  predictionValue = value / elapsedRatio
                  predictionDisplayValue = predictionValue.toLocaleString('en', localeStringOptions)
                }

                const color = item.color
                const compareColor = showCompare && keys.length === 1 ? colors[1] : color

                return (
                  <tr key={item.dataKey} className='recharts-tooltip-item' style={{color: color}}>
                    <td style={{paddingRight: 10}}>{item.name}:</td>
                    {showCompare && <td style={{textAlign: 'right', color: compareColor}}>{compareWithDisplayValue}{unit}</td>}
                    {showCompare && showPercentages && <td style={{textAlign: 'right', color: compareColor}}>{`${Math.round(compareWithPercentage)}%`}</td>}

                    <td style={{textAlign: 'right'}}>{displayValue}{unit}</td>
                    {showPercentages && <td style={{textAlign: 'right'}}>{`${Math.round(percentage)}%`}</td>}
                    {showCompare && <td style={{textAlign: 'right'}}>{diffInCount(compareWithValue, value, localeStringOptions)}</td>}
                    {showCompare && <td style={{textAlign: 'right'}}>{diffInPercentage(compareWithValue, value)}</td>}

                    {showPrediction && <td style={{textAlign: 'right'}}>{predictionDisplayValue}{unit}</td>}
                    {showPrediction && showCompare && <td style={{textAlign: 'right'}}>{diffInCount(compareWithValue, predictionValue, localeStringOptions)}</td>}
                    {showPrediction && showCompare && <td style={{textAlign: 'right'}}>{diffInPercentage(compareWithValue, predictionValue)}</td>}
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
