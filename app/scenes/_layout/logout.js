import './styles.scss'

// libraries
import React, { Component } from 'react'

// utils
import messg from 'messg'

import loginController from '~/scenes/login/controller.rb'

// logic
export default class Logout extends Component {
  handleLogout = () => {
    loginController.logout({}).then(result => {
      if (result.success) {
        window.location.href = '/login'
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
