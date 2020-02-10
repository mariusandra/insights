import React from 'react'
import { useActions, useValues } from 'kea'

import { Button } from 'antd'

import Node from './node'

import explorerLogic from 'scenes/explorer/logic'
import viewsLogic from 'scenes/header/views/logic'
import { useSelector } from 'react-redux'
import locationSelector from 'lib/selectors/location'

export default function SelectedModel () {
  const { selectedModel, savedViews, recommendedViews, modelFavourites, search } = useValues(explorerLogic)
  const { closeModel, focusSearch, openUrl } = useActions(explorerLogic)
  const { openView } = useActions(viewsLogic)
  const { pathname: urlPath, search: urlSearch } = useSelector(locationSelector)

  const url = urlPath + urlSearch

  return (
    <div>
      <div>
        <Button type='link' icon='close' style={{float: 'right'}} onClick={closeModel} />
        <h4 style={{ lineHeight: '30px', fontSize: 18, fontWeight: 'bold' }}>{selectedModel}</h4>
      </div>

      <div className='node' style={{marginBottom: 10}}>
        <div className='node-entry'>
          <div className='node-icon has-children open' />
          <div className='node-title'>
            Recommended views <small className='count-tag'>({recommendedViews.length})</small>
          </div>
        </div>
        <div className='node-children'>
          {recommendedViews.map(view => (
            <div key={view.key} className='node'>
              <div className='node-entry'>
                <div className='node-icon no-children' />
                <div
                  className='node-title'
                  onClick={() => openUrl(view.url)}
                  style={{ fontWeight: url === view.url ? 'bold' : 'normal' }}>
                  {view.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='node' style={{marginBottom: 10}}>
        <div className='node-entry'>
          <div className='node-icon has-children open' />
          <div className='node-title'>
            Saved views <small className='count-tag'>({savedViews.length})</small>
          </div>
        </div>
        <div className='node-children'>
          {savedViews.map(view => (
            <div key={view._id} className='node'>
              <div className='node-entry'>
                <div className='node-icon no-children' />
                <div
                  className='node-title'
                  onClick={() => openView(view._id)}
                  style={{ fontWeight: url === view.path ? 'bold' : 'normal' }}>
                  {view.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='node' style={{marginBottom: 10}}>
        <div className='node-entry'>
          <div className='node-icon has-children open' />
          <div className='node-title'>
            Favourite fields <small className='count-tag'>({modelFavourites.length})</small>
          </div>
        </div>
        <div className='node-children'>
          {modelFavourites.map(favourite => (
            <Node
              key={favourite}
              path={favourite}
              localSearch=''
              connection={favourite.substring(selectedModel.length + 1)}
              focusSearch={focusSearch} />
          ))}
        </div>
      </div>

      <Node key={selectedModel}
            path={selectedModel}
            localSearch={search}
            model={selectedModel}
            focusSearch={focusSearch} />
    </div>
  )
}
