import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

// utils
import { Layout } from 'react-flex-layout'

// components
import Share from './share'

// logic
@connect()
export default class InsightsScene extends Component {
  render () {
    const { dispatch } = this.props

    if (window.location.search.indexOf('embed=true') >= 0 || window.location.pathname === '/login' || window.location.pathname === '/') {
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
            <div className='insights-tab-row'>
              <div className='tab-row-element'>
                <button onClick={() => dispatch(push('/explorer'))} className={window.location.pathname.indexOf('/explorer') === 0 ? 'button' : 'button white'}>Explorer</button>
              </div>
              <div className='tab-row-separator' />
              <Share />
            </div>
          </Layout>
          <Layout layoutHeight='flex'>
            {this.props.children}
          </Layout>
        </Layout>
      </div>
    )
  }
}
