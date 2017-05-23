import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'
import { Responsive, WidthProvider } from 'react-grid-layout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)

// utils

// components
import Graph from '~/scenes/dashboard/graph'

// logic
import dashboardLogic from '~/scenes/dashboard/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = dashboard.constants

@connect({
  actions: [
    dashboardLogic, [
      'setLayout',
      'selectDashboard',
      'addDashboard'
    ]
  ],
  props: [
    dashboardLogic, [
      'dashboards',
      'layout',
      'selectedDashboardId'
    ]
  ]
})
export default class Dashboard extends Component {
  state = {
    currentBreakpoint: 'lg',
    mounted: false
  }

  componentDidMount () {
    this.setState({ mounted: true })
  }

  generateDOM = () => {
    const { layout } = this.props

    if (!layout) {
      return null
    }

    return layout.map(l => {
      return (
        <div key={l.i}>
          <Graph key={l.i} name={l.name} path={l.path} />
        </div>
      )
    })
  }

  render () {
    const { layout, dashboards, selectedDashboardId } = this.props
    const { setLayout, selectDashboard, addDashboard } = this.props.actions

    // breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
    // cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
    return (
      <div className='dashboard-scene'>
        <div className='dashboards-list'>
          {Object.values(dashboards).map(dashboard => (
            <button key={dashboard.id} onClick={() => selectDashboard(dashboard.id)} className={selectedDashboardId === dashboard.id ? '' : 'white'}>{dashboard.name}</button>
          ))}
          <button className='white' onClick={() => addDashboard()}>+ ADD</button>
        </div>

        <ResponsiveReactGridLayout className='layout'
                                   breakpoints={{sm: 768, xxs: 0}}
                                   cols={{sm: 6, xxs: 2}}
                                   rowHeight={30}
                                   layouts={{ sm: layout }}
                                   onLayoutChange={setLayout}
                                   // WidthProvider option
                                   measureBeforeMount>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    )
  }
}
