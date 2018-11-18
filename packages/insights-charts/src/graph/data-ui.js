// /* eslint react/prop-types: 0 */
// import React, { Component } from 'react'
// import { timeParse, timeFormat } from 'd3-time-format'

// import LegendOrdinal from '@vx/legend/build/legends/Ordinal'
// import scaleOrdinal from '@vx/scale/build/scales/ordinal'

// import { XYChart, CrossHair, StackedAreaSeries, PatternCircles, theme, XAxis, YAxis, withParentSize } from '@data-ui/xy-chart'

// const PATTERN_ID_1 = 'stackedarea_1'
// const PATTERN_ID_2 = 'stackedarea_2'
// const PATTERN_ID_3 = 'stackedarea_3'
// const PATTERN_COLOR = theme.colors.categories[4]

// export const parseDate = timeParse('%Y-%m-%d')
// export const formatDate = timeFormat('%d %b %Y')

// const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

// export class BaseGraph extends Component {
//   render () {
//     const { graph, controls, parentWidth, parentHeight } = this.props
//     const { results, keys } = graph

//     const data = results.map(d => ({
//       x: parseDate(d.time),
//       ...keys.reduce(
//         (obj, key) => ({ ...obj, y: obj.y + parseFloat(d[key]), [key]: parseFloat(d[key]) }),
//         { y: 0 }
//       )
//     }))

//     const legendScale = scaleOrdinal({ range: colors, domain: keys })

//     return (
//       <div>
//         <div style={{ marginLeft: 24 }}>
//           <LegendOrdinal
//             key='legend'
//             direction='row'
//             scale={legendScale}
//             shape={({ fill, width, height }) => (
//               <svg width={width} height={height}>
//                 <rect width={width} height={height} fill={fill} />
//               </svg>
//             )}
//             fill={({ datum }) => legendScale(datum)}
//             labelFormat={label => label.indexOf('$$') >= 0 ? label.split('$$', 2)[1] : label}
//           />
//         </div>
//         <XYChart
//           ariaLabel='Graph'
//           key='chart'
//           renderTooltip={({ event, datum, data, color }) => (
//             <div>
//               <div><strong>x </strong>{formatDate(datum.x)}</div>
//               <div><strong>y </strong>{datum.y}</div>
//             </div>
//           )}
//           showXGrid
//           showYGrid
//           width={parentWidth}
//           height={parentHeight}
//           xScale={{ type: 'time' }}
//           yScale={{ type: 'linear' }}
//           margin={{ top: 10, left: 60, right: 60 }}
//         >
//           <StackedAreaSeries
//             data={data}
//             strokeWidth={1}
//             stackKeys={keys}
//             stackFills={colors}
//             interpolation='linear'
//             stroke={({ index }) => colors[index] || '#000'}
//             fillOpacity={0.6}
//             showPoints
//           />
//           <CrossHair
//             stroke={PATTERN_COLOR}
//             strokeWidth={2}
//             showHorizontalLine={false}
//             showCircle={false}
//             strokeDasharray=''
//           />
//           <CrossHair
//             stroke='#fff'
//             strokeWidth={1}
//             showHorizontalLine={false}
//             showCircle={false}
//             strokeDasharray=''
//           />
//           <XAxis tickFormat={formatDate} />
//           <YAxis orientation='left' />
//           <YAxis orientation='right' />
//         </XYChart>
//       </div>
//     )
//   }
// }

// export const Graph = withParentSize(BaseGraph)
