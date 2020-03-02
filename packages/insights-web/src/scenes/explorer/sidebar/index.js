import './styles.scss'

import React, { useEffect } from 'react'
import { useActions, useValues } from 'kea'
import scrollIntoView from 'scroll-into-view'

import { Input } from 'antd'

import Models from './models'
import SelectedModel from './selected-model'
import ConnectionMenu from '../connection/database/menu'
import SubsetMenu from '../connection/subset/menu'

import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../connection/logic'

export default function Sidebar () {
  const { search, selectedModel, selectedKey } = useValues(explorerLogic)
  const { connectionId, subsetId } = useValues(connectionLogic)

  const { setSearch, focusSearch, moveSelectionUp, moveSelectionDown, enterSelection, closeModel, setSelectedKey } = useActions(explorerLogic)

  // eslint-disable-next-line
  useEffect(() => {
    window.setTimeout(focusSearch, 100)
  }, [focusSearch])

  useEffect(() => {
    const element = document.querySelector('.ant-tree-node-selected')
    element && scrollIntoView(element, { time: 0, align: { top: 0.3, left: 0, leftOffset: +1000 } })
  }, [selectedKey, selectedModel])

  return (
    <div className='sidebar-with-search'>
      <div className='explorer-search'>
        {!connectionId ? (
          <h2 className='no-connection'>Select a connection</h2>
        ) : !subsetId ? (
          <h2 className='no-connection'>Select a subset</h2>
        ) : (
          <Input.Search
            id='sidebar-model-field-search'
            placeholder={!selectedModel ? 'Search for a Model' : `Search fields in ${selectedModel}...`}
            autoComplete="off"
            value={search}
            onKeyDown={e => {
              if (e.keyCode === 27) {
                e.preventDefault()
                setSearch('')
                setSelectedKey(selectedModel)
              }
              if (e.keyCode === 8) {
                if (search === '') {
                  e.preventDefault()
                  if (selectedKey === selectedModel) {
                    closeModel(selectedModel)
                  } else {
                    setSelectedKey(selectedModel)
                  }
                }
              }
              if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault()
                if (e.keyCode === 38) {
                  moveSelectionUp()
                }
                if (e.keyCode === 40) {
                  moveSelectionDown()
                }
                if (e.keyCode === 13) {
                  enterSelection()
                }
              }
            }}
            onChange={e => setSearch(e.target.value)}
          />
        )}
      </div>
      <div className={`explorer-tree${!connectionId || !subsetId ? ' no-connection' : ''}${selectedModel ? ' selected-model' : ''}`}>
        {!connectionId ? (
          <ConnectionMenu />
        ) : !subsetId ? (
          <SubsetMenu />
        ) : selectedModel ? (
          <SelectedModel />
        ) : (
          <Models />
        )}
      </div>
    </div>
  )
}
