// libraries
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import moment from 'moment'

// utils

// components
import BasicTooltip from './basic-tooltip'

// logic

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
  const { results, keys } = graph
  const { percentages } = controls

  const graphData = results.map(oldRow => {
    const time = oldRow.time
    const row = Object.assign({}, oldRow, { time: moment(time).valueOf() })

    if (percentages) {
      let total = 0
      for (const key of keys) {
        total += parseFloat(row[key])
      }
      for (const key of keys) {
        row[key + '__%'] = total !== 0 ? (parseFloat(row[key]) / total * 100) : 0
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
      labels: PropTypes.bool
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
      unit = timeGroup
    } else if (timeEnd - timeStart < 32 * day && timeGroup !== 'week') {
      unit = 'day'
    } else if (timeEnd - timeStart < 365 * day) {
      unit = 'week'
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

  getLineData = (key, stacked) => {
    const { percentages, labels } = this.props.controls

    let data = {
      key: `${key.key}${percentages ? '__%' : ''}${key.visible ? '' : '__hidden'}`,
      type: 'linear',
      dataKey: `${key.key}${percentages ? '__%' : ''}${key.visible ? '' : '__hidden'}`,
      name: key.name,
      stroke: key.color,
      fill: key.color,
      strokeWidth: 1,
      legendType: 'circle',
      label: labels ? this.renderLabel : false,
      dot: {r: 2, fill: key.color, fillOpacity: 0.5},
      activeDot: {r: 6},
      isAnimationActive: false,
      stackId: stacked ? (key.key.indexOf('$$') > 0 ? key.key.split('$$')[0] : '1') : key.key
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
        <text x={x}
          y={y}
          dy={-5}
          fill={'#fff'}
          stroke={'#fff'}
          strokeWidth={3}
          strokeOpacity={0.9}
          fontSize={10}
          textAnchor='middle'>
          {displayValue}{percentages ? '%' : ''}
        </text>
        <text x={x}
          y={y}
          dy={-5}
          fill={stroke}
          fontSize={10}
          textAnchor='middle'>
          {displayValue}{percentages ? '%' : ''}
        </text>
      </g>
    )
  }

  render () {
    const { graph, controls: { sort, percentages, type, labels }, tooltip: TooltipProp } = this.props
    const { graphData } = this.state

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
          margin={{top: 0, right: 10, left: 0, bottom: 0}}>
          <Legend
            verticalAlign='top'
            align='right'
            height={25}
            iconSize={10}
            wrapperStyle={{fontSize: 12, marginRight: -10}}
            onClick={this.handleClick}
            onMouseOver={this.handleMouseEnter}
            onMouseOut={this.handleMouseLeave} />
          <XAxis
            type='number'
            dataKey='time'
            domain={xDomain}
            tickFormatter={tickFormatter}
            ticks={ticks} />
          <YAxis
            domain={percentages ? [0, 100] : ['auto', 'auto']}
            interval={0}
            tickFormatter={percentages ? (y) => `${Math.round(y)}%` : (y) => `${y.toLocaleString('en')}${unit}`}
            allowDecimals={false} />
          <CartesianGrid />
          <Tooltip content={<TooltipProp graph={graph} />} percentages={percentages} />
          {nullLineNeeded ? (
            <ReferenceLine y={0} stroke='red' alwaysShow />
          ) : null}
          {sortedKeysWithMeta.map(key => (
            type === 'area'
              ? <Area {...this.getLineData(key, facets)} />
              : type === 'bar'
                ? <Bar {...this.getLineData(key, facets)} />
                : <Line {...this.getLineData(key, facets)} />))}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }
}
