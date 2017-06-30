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
    const { active, payload, label, graph } = this.props
    const percentages = false
    const controls = false
    const unit = ''
    const facets = graph.facets && graph.facets.length > 0

    const lightMode = !controls

    if (active) {
      const visiblePayload = payload.filter(item => item.dataKey.indexOf('__hidden') < 0)

      const total = visiblePayload.map(item => percentages ? item.payload[item.dataKey.replace('__%', '')] : item.value - 0).reduce((a, b) => a + b, 0)
      const max = visiblePayload.map(p => p.value).reduce((a, b) => Math.max(a, b), 0)
      const percentageFrom = facets ? total : max

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
                </tr>
              ) : null}
              {visiblePayload.map(item => {
                const value = (percentages ? item.payload[item.dataKey.replace('__%', '')] : item.value - 0) || 0
                const displayValue = unit ? value.toLocaleString('en', localeStringOptions) : value
                const percentage = percentages ? Math.round(item.value) : Math.round(value / percentageFrom * 100)

                return (
                  <tr key={item.dataKey} className='recharts-tooltip-item' style={{color: item.color}}>
                    <td style={{paddingRight: 10}}>{item.name}:</td>
                    {!lightMode || !percentages ? (
                      <td style={{textAlign: 'right'}}>{displayValue}{unit}</td>
                    ) : null}
                    {lightMode && percentages ? (
                      <td style={{textAlign: 'right'}}>{`${percentage}%`}</td>
                    ) : null}
                    {!lightMode && visiblePayload.length > 1 ? (
                      <td style={{textAlign: 'right', paddingLeft: 10}}>{`(${percentage}%)`}</td>
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
