import './styles.scss'

import React from 'react'

import { useValues } from 'kea'

import Header from 'scenes/header'
import Spinner from 'lib/tags/spinner'

import Setup from 'scenes/setup'
import Login from 'scenes/login'

import authLogic from 'scenes/auth'

export default function InsightsLayout ({ children }) {
  const { showSetup, showLogin, showApp } = useValues(authLogic)

  if (!showLogin && !showApp && !showSetup) {
    return <div style={{marginTop: 20, marginLeft: 20}}><Spinner /></div>
  }

  // override whatever the router gives us
  if (showSetup) {
    return (
      <div className='insights-layout'>
        <Setup />
      </div>
    )
  }

  // override whatever the router gives us
  if (showLogin) {
    return (
      <div className='insights-layout'>
        <Login />
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
