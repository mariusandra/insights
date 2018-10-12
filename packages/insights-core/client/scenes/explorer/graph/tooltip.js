import React, { Component, PropTypes } from 'react'
import moment from 'moment'

export default class Tooltip extends Component {
  static propTypes = {
    graph: PropTypes.object
  }

  labelFormatter (time) {
    const { graph: { timeGroup } } = this.props

    if (timeGroup === 'month') {
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
    const { active, payload, label, graph, percentages } = this.props
    const unit = ''
    const facets = graph.facets && graph.facets.length > 0

    if (active) {
      const visiblePayload = payload.filter(item => item.dataKey.indexOf('__hidden') < 0)

      const total = visiblePayload.map(item => percentages ? parseFloat(item.payload[item.dataKey.replace('__%', '')]) : item.value - 0).reduce((a, b) => a + b, 0)
      const totalPercentage = percentages ? visiblePayload.map(item => parseFloat(item.payload[item.dataKey])).reduce((a, b) => a + b, 0) : 100
      const percentageFrom = facets ? total : visiblePayload.map(p => p.value).reduce((a, b) => Math.max(a, b), 0)

      const localeStringOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

      return (
        <div className='recharts-default-tooltip' style={{background: 'white', border: '1px solid #ddd', padding: '10px', boxShadow: '1px 1px 3px rgba(0,0,0,0.24)'}}>
          <p className='recharts-tooltip-label' style={{marginBottom: 10}}>
            {this.labelFormatter(label)}
          </p>
          <table>
            <tbody>
              {facets ? (
                <tr>
                  <td style={{paddingRight: 5, paddingBottom: 5}}>Total:</td>
                  <td style={{textAlign: 'right'}}>{total.toLocaleString('en', localeStringOptions)}{unit}</td>
                  {percentages ? (
                    <td style={{textAlign: 'right'}}>{Math.round(totalPercentage)}%</td>
                  ) : null}
                </tr>
              ) : null}
              {visiblePayload.map(item => {
                const value = (percentages ? item.payload[item.dataKey.replace('__%', '')] : item.value - 0) || 0
                // const displayValue = unit ? value.toLocaleString('en', localeStringOptions) : value
                const displayValue = value.toLocaleString('en', localeStringOptions)
                const percentage = percentages ? item.payload[item.dataKey] : Math.round(value / percentageFrom * 100)

                return (
                  <tr key={item.dataKey} className='recharts-tooltip-item' style={{color: item.color}}>
                    <td style={{paddingRight: 10}}>{item.name}:</td>
                    <td style={{textAlign: 'right'}}>{displayValue}{unit}</td>
                    {percentages ? (
                      <td style={{textAlign: 'right'}}>{`${Math.round(percentage, 2)}%`}</td>
                    ) : null}
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
