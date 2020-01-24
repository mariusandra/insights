import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'
import { Alignment, Navbar, Tab, Tabs } from "@blueprintjs/core";

import User from './user'
import Views from './views'
import Share from './share'
import CopyQuery from './copy-query'

import authLogic from 'scenes/auth'
import headerLogic from 'scenes/header/logic'
import sceneSaga from 'scenes/header/saga'
import viewsSaga from 'scenes/header/views/saga'

const logic = connect({
  actions: [
    headerLogic, [
      'openLocation'
    ]
  ],
  props: [
    state => state.router.location, [
      'pathname',
      'search'
    ],
    authLogic, [
      'user',
      'runningInElectron'
    ]
  ],
  sagas: [
    sceneSaga,
    viewsSaga
  ]
})

class HeaderScene extends Component {
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

  openPage = (page) => {
    const { openLocation } = this.props.actions
    openLocation(this._pathHistory[page] || `/${page}`)
  }

  render () {
    const { user, pathname, runningInElectron } = this.props

    const animate = true

    const page = pathname.indexOf('/explorer') === 0 || pathname === '/'
                  ? 'explorer'
                  : pathname.indexOf('/connections') === 0
                    ? 'connections'
                    : 'root'

    return (
      <Navbar className='bp3-dark' style={{ borderBottom: '1px solid #dbdcdd' }}>
        <Navbar.Group>
          <Tabs
            className='bp3-dark'
            animate={animate}
            id='navbar'
            large
            onChange={this.openPage}
            selectedTabId={page}>
            <Tab id='connections' title='Connections' />
            <Tab id='explorer' icon='search-around' title='Explorer' />
          </Tabs>
        </Navbar.Group>
        {user ? <Navbar.Group align={Alignment.RIGHT}>
          <User email={user.email} />
        </Navbar.Group> : null}
        {page === 'explorer' && !runningInElectron ? <Navbar.Group align={Alignment.RIGHT}>
          <CopyQuery />
        </Navbar.Group> : null}
        {!runningInElectron ? <Navbar.Group align={Alignment.RIGHT}>
          <Share />
        </Navbar.Group> : null}
        <Navbar.Group align={Alignment.RIGHT}>
          <Views />
        </Navbar.Group>
      </Navbar>
    )
  }
}

export default logic(HeaderScene)
