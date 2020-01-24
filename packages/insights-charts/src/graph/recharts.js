import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import moment from 'moment'

import BasicTooltip from './basic-tooltip'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

function sharedStart (array) {
  let A = array.concat().sort()
  let a1 = A[0]
  let a2 = A[A.length - 1]
  let L = a1.length
  let i = 0
  while (i < L && a1.charAt(i) === a2.charAt(i)) { i++ }
  return a1.substring(0, i)
}

const alphabeticalFacetSorter = (a, b) => a.name.localeCompare(b.name)

function getGraphData (graph, controls) {
  const { results, keys, timeGroup } = graph
  const { percentages, compareWith, compareWithPercentageLine, prediction } = controls

  const graphData = results.map(oldRow => {
    const time = oldRow.time
    const row = Object.assign({}, oldRow, { time: moment(time).valueOf() })

    if (percentages || (compareWith)) {
      let total = 0
      for (const key of keys) {
        total += parseFloat(row[key] || 0)
      }
      if (percentages) {
        for (const key of keys) {
          row[key + '__%'] = total !== 0 ? (parseFloat(row[key]) / total * 100) : 0
        }
      }

      if (compareWith) {
        let compareWithTotal = 0
        for (const key of keys) {
          compareWithTotal += parseFloat(row['compareWith::' + key] || 0)
        }

        if (percentages) {
          for (const key of keys) {
            row['compareWith::' + key + '__%'] = compareWithTotal !== 0 ? (parseFloat(row['compareWith::' + key]) / compareWithTotal * 100) : 0
          }
        }

        if (compareWithPercentageLine && compareWithTotal !== 0) {
          let totalToCompareWith = compareWithTotal

          if (prediction) {
            if (moment().startOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).format('YYYY-MM-DD') === time) {
              const fullTime = moment().endOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).unix() - moment().startOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).unix()
              const elapsedTime = moment().unix() - moment().startOf(timeGroup === 'week' ? 'isoWeek' : timeGroup).unix()

              totalToCompareWith = totalToCompareWith * elapsedTime / fullTime
            }
          }

          row['compareWith:percentageLine'] = (total - totalToCompareWith) / totalToCompareWith * 100
        }
      }
    }
    return row
  })

  return graphData
}

export class Graph extends Component {
  static propTypes = {
    graph: PropTypes.object,

    controls: PropTypes.shape({
      type: PropTypes.oneOf(['area', 'bar', 'line']).isRequired,
      sort: PropTypes.oneOf(['123', 'abc']).isRequired,
      cumulative: PropTypes.bool,
      percentages: PropTypes.bool,
      labels: PropTypes.bool,
      compareWith: PropTypes.number,
      compareWithPercentageLine: PropTypes.bool,
      prediction: PropTypes.bool
    }).isRequired
  }

  static defaultProps = {
    tooltip: BasicTooltip
  }

  constructor (props) {
    super(props)

    this.state = {
      visibility: {},
      graphData: getGraphData(props.graph, props.controls)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.graph !== nextProps.graph || this.props.controls !== nextProps.controls) {
      this.setState({
        graphData: getGraphData(nextProps.graph, nextProps.controls)
      })
    }
  }

  handleClick = (o) => {
    const { dataKey } = o
    const { visibility } = this.state

    const key = dataKey.replace(/__hidden$/, '')

    this.setState({
      visibility: { ...visibility, [key]: typeof visibility[key] === 'undefined' ? false : !visibility[key] }
    })
  }

  timeFormatter (time) {
    return moment(time).format('MMM DD')
  }

  yearFormatter (time) {
    return moment(time).format('YYYY')
  }

  quarterFormatter (time) {
    return 'Q' + moment(time).format('Q YYYY')
  }

  shortQuarterFormatter (time) {
    return 'Q' + moment(time).format('Q\'YY')
  }

  monthFormatter (time) {
    return moment(time).format(moment(time).month() === 0 ? 'YYYY' : 'MMMM')
  }

  shortMonthFormatter (time) {
    return moment(time).format(moment(time).month() === 0 ? 'YYYY' : 'MMM')
  }

  getTicks () {
    // const { data, timeGroup } = this.props
    const { graph: { timeGroup } } = this.props
    const { graphData: data } = this.state

    let ticks = []

    if (data.length === 0) {
      return ticks
    }

    const timeStart = data[0].time
    const timeEnd = data[data.length - 1].time

    const day = 86000 * 1000

    let unit = 'month'

    if (timeGroup === 'month' || timeGroup === 'year' || timeGroup === 'quarter') {
      unit = timeGroup === 'week' ? 'isoWeek' : timeGroup
    } else if (timeEnd - timeStart < 32 * day && timeGroup !== 'week') {
      unit = 'day'
    } else if (timeEnd - timeStart < 365 * day) {
      unit = 'isoWeek'
    }

    let time = moment(timeStart).startOf(unit)
    if (time >= timeStart) {
      ticks.push(time.valueOf())
    }
    while (time < timeEnd) {
      time = time.add(1, unit)
      if (time <= timeEnd) {
        ticks.push(time.valueOf())
      }
    }

    const tickFormatter = unit === 'year' ? this.yearFormatter
      : unit === 'quarter' ? (ticks.length > 5 ? this.shortQuarterFormatter : this.quarterFormatter)
        : unit === 'month' ? (ticks.length > 13 ? this.shortMonthFormatter : this.monthFormatter)
          : this.timeFormatter

    return { ticks, tickFormatter }
  }

  getKeysWithMeta () {
    const { graph: { keys } } = this.props
    const { visibility } = this.state
    let i = 0

    let nameSubString = keys.length === 1 ? keys[0].split('.')[0].length + 1 : sharedStart(keys).length

    return keys.filter(v => v).map(v => {
      const visible = typeof visibility[v] === 'undefined' || visibility[v]
      const object = {
        key: v,
        name: v.substring(nameSubString).split(/[_!$]/).join(' ') || 'empty',
        visible: visible,
        color: visible ? colors[i] : 'white'
      }
      i += 1
      return object
    })
  }

  getLineData = (key, stacked, compareWith = null) => {
    const { keys, timeGroup } = this.props.graph
    const { percentages, labels, type } = this.props.controls

    const color = compareWith && keys.length === 1 ? colors[1] : key.color

    let data = {
      key: `${compareWith ? 'compareWith::' : ''}${key.key}${percentages ? '__%' : ''}${key.visible ? '' : '__hidden'}`,
      type: 'linear',
      dataKey: `${compareWith ? 'compareWith::' : ''}${key.key}${percentages ? '__%' : ''}${key.visible ? '' : '__hidden'}`,
      name: key.name + (compareWith ? ` (${compareWith} ${timeGroup}${compareWith === 1 ? '' : 's'} ago)` : ''),
      stroke: color,
      strokeOpacity: compareWith ? 0.5 : 1,
      strokeWidth: 1,
      fill: color,
      fillOpacity: type === 'bar' ? (compareWith ? 0.5 : 0.9) : 0.6,
      legendType: 'circle',
      label: labels ? this.renderLabel : false,
      isAnimationActive: false,
      stackId: (compareWith ? 'compareWith::' : '') + (stacked ? (key.key.indexOf('$$') > 0 ? key.key.split('$$')[0] : '1') : key.key)
    }

    if (type !== 'bar') {
      data.dot = { r: 2, fill: key.color, fillOpacity: 0.5 }
      data.activeDot = { r: 6 }
    }

    return data
  }

  getCompareWithPercentageLine = (key) => {
    const { labels } = this.props.controls

    let data = {
      key: 'compareWith:percentageLine',
      type: 'linear',
      dataKey: 'compareWith:percentageLine',
      name: 'old vs new',
      stroke: colors[1],
      strokeOpacity: 1,
      strokeWidth: 2,
      style: {
        filter: 'drop-shadow( 0 0 4px #fff )'
      },
      legendType: 'circle',
      label: labels ? this.renderLabel : false,
      isAnimationActive: false,
      stackId: 'compareWith:percentageLine',
      dot: { r: 2, fill: colors[1], fillOpacity: 0.5 },
      activeDot: { r: 6 },
      yAxisId: 'percentageLine'
    }

    return data
  }

  renderLabel = (props) => {
    const { percentages } = this.props.controls

    const { x, y, stroke, value, key } = props
    const displayValue = Array.isArray(value) ? Math.round(value[1] - value[0]) : Math.round(parseFloat(value))

    if (percentages && displayValue === 100) {
      return null
    }

    return (
      <g key={key}>
        <text
          x={x}
          y={y}
          dy={-5}
          fill='#fff'
          stroke='#fff'
          strokeWidth={3}
          strokeOpacity={0.9}
          fontSize={10}
          textAnchor='middle'
        >
          {displayValue}{percentages ? '%' : ''}
        </text>
        <text
          x={x}
          y={y}
          dy={-5}
          fill={stroke}
          fontSize={10}
          textAnchor='middle'
        >
          {displayValue}{percentages ? '%' : ''}
        </text>
      </g>
    )
  }

  render () {
    const { graph, controls, tooltip: TooltipProp, children } = this.props
    const { graphData } = this.state
    const { sort, percentages, type, labels, compareWith, compareWithPercentageLine, compareWithPercentageLineDomain } = controls

    const nullLineNeeded = false
    const unit = ''
    const facets = graph.facets && graph.facets.length > 0
    const { timeGroup } = graph

    const keysWithMeta = this.getKeysWithMeta()

    // change the key on visibilty changes so the lines would update
    // changing this triggers the chart to be torn down and re-rendered
    const key = keysWithMeta.map(k => `${k.visible}`).join(',') + `${labels ? '-labels' : ''}${type === 'line' ? '-line' : ''}-${sort}`

    const { ticks, tickFormatter } = this.getTicks()

    let xDomain = ['dataMin', 'dataMax']

    if (type === 'bar' && graphData.length > 0) {
      xDomain = [
        moment(graphData[0].time).add(-0.5, timeGroup).valueOf(),
        moment(graphData[graphData.length - 1].time).add(0.5, timeGroup).valueOf()
      ]
    }

    const sortedKeysWithMeta = facets
      ? sort === 'abc'
        ? keysWithMeta.sort(alphabeticalFacetSorter)
        : keysWithMeta.reverse()
      : keysWithMeta

    return (
      <ResponsiveContainer>
        <ComposedChart
          data={graphData}
          key={key}
          margin={{top: 0, right: 10, left: 10, bottom: 0}}
        >
          <Legend
            verticalAlign='top'
            align='left'
            height={25}
            iconSize={10}
            wrapperStyle={{fontSize: 12, marginRight: -10}}
            onClick={this.handleClick}
            onMouseOver={this.handleMouseEnter}
            onMouseOut={this.handleMouseLeave}
          />
          <XAxis
            type='number'
            dataKey='time'
            domain={xDomain}
            tickFormatter={tickFormatter}
            ticks={ticks}
          />
          <YAxis
            domain={percentages ? [0, 100] : ['auto', 'auto']}
            interval={0}
            orientation='right'
            tickFormatter={percentages ? (y) => `${Math.round(y)}%` : (y) => `${y.toLocaleString('en')}${unit}`}
            allowDecimals={false}
          />
          <CartesianGrid />
          <Tooltip content={<TooltipProp graph={graph} controls={controls} />} />
          {nullLineNeeded ? (
            <ReferenceLine y={0} stroke='red' alwaysShow />
          ) : null}
          {compareWith && sortedKeysWithMeta.map(key => <Bar {...this.getLineData(key, facets, compareWith)} />)}
          {sortedKeysWithMeta.map(key => (
            type === 'area'
              ? <Area {...this.getLineData(key, facets)} />
              : type === 'bar'
                ? <Bar {...this.getLineData(key, facets)} />
                : <Line {...this.getLineData(key, facets)} />))}
          {compareWith && compareWithPercentageLine && (
            <Line {...this.getCompareWithPercentageLine()} />
          )}
          {compareWith && compareWithPercentageLine && (
            <YAxis
              yAxisId='percentageLine'
              orientation='left'
              tickFormatter={(y) => `${y > 0 ? '+' : ''}${Math.round(y)}%`}
              domain={compareWithPercentageLineDomain || [dataMin => Math.floor(Math.min(0, dataMin || 0)), dataMax => Math.ceil(Math.max(dataMax || 0, 0) / 25) * 25]}
            />
          )}
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }
}
