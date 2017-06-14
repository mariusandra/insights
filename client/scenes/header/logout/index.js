// libraries
import React, { Component } from 'react'

// utils
import messg from 'messg'

import client from '~/client'

// logic
export default class Logout extends Component {
  handleLogout = (e) => {
    e.preventDefault()
    client.logout()
    window.location.href = '/login'
    // loginController.logout({}).then(result => {
    //   if (result.success) {
    //     window.location.href = '/login'
    //   } else {
    //     messg.error('Error', 2500)
    //   }
    // })
  }

  render () {
    return (
      <div className='tab-row-element'>
        <a onClick={this.handleLogout} href='#'>
          Logout
        </a>
      </div>
    )
  }
}
