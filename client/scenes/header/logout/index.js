// libraries
import React, { Component } from 'react'

// utils
import client from '~/client'

// logic
export default class Logout extends Component {
  handleLogout = (e) => {
    e.preventDefault()
    client.logout()
    window.location.href = '/login'
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
