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
import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'clear'
    ]
  ],
  props: [
    state => state.rails, [
      'currentUser',
      'loginNeeded'
    ]
  ]
})
export default class HeaderScene extends Component {
  render () {
    const { currentUser, loginNeeded } = this.props
    const { clear } = this.props.actions

    return (
      <div className='header-scene'>
        <div className='insights-tab-row'>
          <div className='tab-row-element'>
            <button onClick={clear} className={window.location.pathname.indexOf('/explorer') === 0 ? 'button' : 'button white'}>Explorer</button>
          </div>
          {loginNeeded ? <Logout /> : null}
          {currentUser ? (
            <div className='tab-row-element'>
              {currentUser}
            </div>
          ) : null}
          <div className='tab-row-separator' />
          <Views />
          <Share />
        </div>
      </div>
    )
  }
}
