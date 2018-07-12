import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'

import './styles.scss'

// libraries
import React, { Component } from 'react'

// utils
import { Layout } from 'react-flex-layout'
import { connect } from 'kea/logic'

// components
import Header from '~/scenes/header'
import Spinner from 'lib/tags/spinner'

// logic
import authLogic from '~/scenes/auth'

@connect({
  props: [
    authLogic, [
      'showLogin',
      'showApp'
    ]
  ]
})
export default class InsightsScene extends Component {
  render () {
    const { showLogin, showApp } = this.props

    if (!showLogin && !showApp) {
      return <div style={{marginTop: 20, marginLeft: 20}}><Spinner /></div>
    }

    if (showLogin || window.location.search.indexOf('embed=true') >= 0) {
      return (
        <div className='insights-scene'>
          <Layout fill='window'>
            {this.props.children}
          </Layout>
        </div>
      )
    }

    return (
      <div className='insights-scene' style={{minHeight: '100%'}}>
        <Layout fill='window'>
          <Layout layoutHeight={50}>
            <Header />
          </Layout>
          <Layout layoutHeight='flex'>
            {this.props.children}
          </Layout>
        </Layout>
      </div>
    )
  }
}
