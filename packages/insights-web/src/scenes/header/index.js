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
import { Modal, Icon, Button } from 'antd'
import layoutLogic from '../_layout/logic'

const locationSelector = state => state.router.location

const pathHistoryReducer = (state, { page, url }) => ({ ...state, [page]: url })

export function openDashboards () {
  Modal.info({
    title: 'DashboardsNotFoundException',
    content: (
      <div>
        <p>You're using an early release of Insights which doesn't yet support Dashboards.</p>
        <p>Please consider sponsoring this project if you want to see dashboards implemented quickly!</p>
        <p><a href='https://github.com/sponsors/mariusandra' target='_blank' rel="noopener noreferrer">https://github.com/sponsors/mariusandra</a></p>
      </div>
    ),
    onOk() {},
  });
}

export default function HeaderScene () {
  useMountedLogic(sceneSaga)

  const [pathHistory, updatePathHistory] = useReducer(pathHistoryReducer, {})
  const { pathname, search } = useSelector(locationSelector)
  const { user } = useValues(authLogic)
  const { openLocation } = useActions(headerLogic)

  const { toggleMenu } = useActions(layoutLogic)
  const { menuOpen } = useValues(layoutLogic)

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
        <Button onClick={page === 'explorer' ? toggleMenu : () => openLocation(pathHistory['explorer'] || `/explorer`)} type='link'>
          <Icon type={page === 'explorer' ? (menuOpen ? 'menu-fold' : 'menu') : 'home'} style={{ color: 'white' }} />
        </Button>
        <span className={`header-link ${page === 'explorer' ? 'selected' : ''}`} onClick={() => openLocation(pathHistory['explorer'] || `/explorer`)}>
          Explorer
        </span>
        <span className='header-link' onClick={openDashboards}>
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
