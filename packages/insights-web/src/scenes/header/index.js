import './styles.scss'

import React, { useEffect, useReducer } from 'react'
import { useActions, useMountedLogic, useValues } from 'kea'
import { useSelector } from 'react-redux'
import { Alignment, Navbar, Tab, Tabs } from "@blueprintjs/core";

import User from './user'
import Views from './views'
import Share from './share'
import CopyQuery from './copy-query'

import authLogic from 'scenes/auth'
import headerLogic from 'scenes/header/logic'
import sceneSaga from 'scenes/header/saga'
import viewsSaga from 'scenes/header/views/saga'

const locationSelector = state => state.router.location

const pathHistoryReducer = (state, { page, url }) => ({ ...state, [page]: url })

export default function HeaderScene () {
  useMountedLogic(sceneSaga)
  useMountedLogic(viewsSaga)

  const [pathHistory, updatePathHistory] = useReducer(pathHistoryReducer, {})
  const { pathname, search } = useSelector(locationSelector)
  const { user } = useValues(authLogic)
  const { openLocation } = useActions(headerLogic)

  useEffect(() => {
    const page = pathname.split('/')[1] || 'root'
    updatePathHistory({ page, url: pathname + search })
  }, [pathname, search])

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
          animate
          id='navbar'
          large
          onChange={p => openLocation(pathHistory[p] || `/${p}`)}
          selectedTabId={page}>
          <Tab id='connections' title='Connections' />
          <Tab id='explorer' icon='search-around' title='Explorer' />
        </Tabs>
      </Navbar.Group>
      {user ? <Navbar.Group align={Alignment.RIGHT}>
        <User email={user.email} />
      </Navbar.Group> : null}
      {page === 'explorer' ? <Navbar.Group align={Alignment.RIGHT}>
        <CopyQuery />
      </Navbar.Group> : null}
      <Navbar.Group align={Alignment.RIGHT}>
        <Share />
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <Views />
      </Navbar.Group>
    </Navbar>
  )
}
