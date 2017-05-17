import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

// utils
import messg from 'messg'

import loginController from '~/scenes/login/controller.rb'

// logic
@connect()
export default class Logout extends Component {
  handleLogout = () => {
    const { dispatch } = this.props

    loginController.logout({}).then(result => {
      if (result.success) {
        dispatch(push('/login'))
      } else {
        messg.error('Error', 2500)
      }
    })
  }

  render () {
    return (
      <div className='tab-row-element'>
        <button onClick={this.handleLogout}>
          Logout
        </button>
      </div>
    )
  }
}
