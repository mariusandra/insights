import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils
import { Responsive, WidthProvider } from 'react-grid-layout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)

// components

// logic
import dashboard from '~/scenes/dashboard/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = dashboard.constants

@connect({
  actions: [
    dashboard, [
      'setLayout'
    ]
  ],
  props: [
    dashboard, [
      'layout'
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

    let i = 0
    return layout.map(l => {
      return (
        <div key={i++} className={l.static ? 'static' : ''}>
          {l.static
            ? <span className='text' title='This item is static and cannot be removed or resized.'>Static - {i}</span>
            : <span className='text'>{i}</span>
          }
        </div>
      )
    })
  }

  render () {
    const { layout } = this.props
    const { setLayout } = this.props.actions

    // breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
    // cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
    return (
      <div className='dashboard-scene'>
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
