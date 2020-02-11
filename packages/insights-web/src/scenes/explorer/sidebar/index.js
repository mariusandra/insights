import './styles.scss'

import React, { useEffect } from 'react'
import { useActions, useValues } from 'kea'
import { Layout } from 'react-flex-layout'

import { Input } from 'antd'

import Connection from '../connection'

import explorerLogic from 'scenes/explorer/logic'
import Models from './models'
import SelectedModel from './selected-model'

export default function Sidebar () {
  const { search, selectedModel } = useValues(explorerLogic)
  const { setSearch, focusSearch } = useActions(explorerLogic)

  // eslint-disable-next-line
  useEffect(() => { window.setTimeout(focusSearch, 100) }, [])

  return (
    <Layout>
      <Layout layoutHeight={100}>
        <div>
          <div style={{ padding: 10, paddingBottom: 0 }}>
            <Connection />
          </div>
          <div style={{ padding: 10 }}>
            <Input.Search
              id='sidebar-model-field-search'
              placeholder='Type to search...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Layout>
      <Layout layoutHeight='flex'>
        <div className={`explorer-tree${selectedModel ? ' selected-model' : ''}`}>
          {selectedModel ? (
            <SelectedModel />
          ) : (
            <Models />
          )}
        </div>
      </Layout>
    </Layout>
  )
}
