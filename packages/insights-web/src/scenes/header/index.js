import './styles.scss'

import React, { useEffect, useReducer } from 'react'
import { useActions, useMountedLogic, useValues } from 'kea'
import { useSelector } from 'react-redux'

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
    <div className='header-navbar'>
      <div>
        <span className='header-link selected' onClick={() => openLocation(pathHistory['explorer'] || `/explorer`)}>
          Explorer
        </span>
        <span className='header-link'>
          Dashboard
        </span>
      </div>

      <div style={{ width: 'auto' }} />

      <div style={{ marginTop: 8, marginRight: 8 }}>
        <Views />
        <Share />
        {page === 'explorer' ? <CopyQuery /> : null}
        {user ? <User email={user.email} /> : null}
      </div>
    </div>
  )
}
