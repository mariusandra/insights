import './styles.scss'

import React from 'react'

import { useValues } from 'kea'

import Header from 'scenes/header'
import Spinner from 'lib/tags/spinner'

import Login from '../login'

import authLogic from 'scenes/auth'

export default function InsightsLayout ({ children }) {
  const { showLogin, showApp } = useValues(authLogic)

  if (!showLogin && !showApp) {
    return <div style={{marginTop: 20, marginLeft: 20}}><Spinner /></div>
  }

  if (showLogin || window.location.search.indexOf('embed=true') >= 0) {
    return (
      <div className='insights-layout'>
        {showLogin ? <Login /> : children}
      </div>
    )
  }

  return (
    <div className='insights-layout'>
      <Header />
      <div className='insights-content-wrapper'>
        {children}
      </div>
    </div>
  )
}
