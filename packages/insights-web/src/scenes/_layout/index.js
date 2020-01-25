import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'

import './styles.scss'

import React from 'react'

import { Layout } from 'react-flex-layout'
import { useValues } from 'kea'

import Header from 'scenes/header'
import Spinner from 'lib/tags/spinner'

import authLogic from 'scenes/auth'

export default function InsightsLayout ({ children }) {
  const { showLogin, showApp } = useValues(authLogic)

  if (!showLogin && !showApp) {
    return <div style={{marginTop: 20, marginLeft: 20}}><Spinner /></div>
  }

  if (showLogin || window.location.search.indexOf('embed=true') >= 0) {
    return (
      <div className='insights-scene'>
        <Layout fill='window'>
          {children}
        </Layout>
      </div>
    )
  }

  return (
    <div className='insights-scene' style={{minHeight: '100%'}}>
      <Layout fill='window'>
        <Layout layoutHeight={50}>
          <Header />
        </Layout>
        <Layout layoutHeight='flex'>
          {children}
        </Layout>
      </Layout>
    </div>
  )
}
