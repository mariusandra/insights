import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components
import Logout from './logout'
import Views from './views'
import Share from './share'

// logic
import authLogic from '~/scenes/auth'
import headerLogic from '~/scenes/header/logic'

@connect({
  actions: [
    headerLogic, [
      'openLocation'
    ]
  ],
  props: [
    state => state.routing.locationBeforeTransitions, [
      'pathname',
      'search'
    ],
    authLogic, [
      'user',
      'loginNeeded'
    ]
  ]
})
export default class HeaderScene extends Component {
  constructor (props) {
    super(props)
    this._pathHistory = {}
  }

  componentWillUpdate (nextProps) {
    const page = nextProps.pathname.split('/')[1] || 'root'
    this._pathHistory[page] = nextProps.pathname + nextProps.search
  }

  openLocation = (pathname) => {
    const { openLocation } = this.props.actions
    const page = pathname.split('/')[1] || 'root'
    openLocation(this._pathHistory[page] || pathname)
  }

  render () {
    const { user, loginNeeded, pathname } = this.props

    return (
      <div className='header-scene'>
        <div className='insights-tab-row'>
          <div className='tab-row-element'>
            <button onClick={() => this.openLocation('/explorer')} className={pathname.indexOf('/explorer') === 0 || pathname === '/' ? 'button' : 'button white'}>Explorer</button>
          </div>
          <div className='tab-row-element'>
            <button onClick={() => this.openLocation('/dashboard')} className={pathname.indexOf('/dashboard') === 0 ? 'button' : 'button white'}>Dashboard</button>
          </div>
          {user ? (
            <div className='tab-row-element'>
              {user.email}
            </div>
          ) : null}
          {loginNeeded ? <Logout /> : null}
          <div className='tab-row-separator' />
          <Views />
          <Share />
        </div>
      </div>
    )
  }
}
