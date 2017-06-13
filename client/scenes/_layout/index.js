import './styles.scss'

// libraries
import React, { Component } from 'react'

// utils
import { Layout } from 'react-flex-layout'

// components
import Header from '~/scenes/header'

// logic

export default class InsightsScene extends Component {
  render () {
    if (window.location.search.indexOf('embed=true') >= 0 || window.location.pathname === '/login') {
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
          <Layout layoutHeight={40}>
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
