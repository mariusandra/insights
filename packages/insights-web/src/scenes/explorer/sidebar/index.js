import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'
import { Layout } from 'react-flex-layout'

import HighlightText from 'lib/utils/highlight-text'
import { Button, Input } from 'antd'

import Node from './node'
import Connection from './connection'

import explorerLogic from 'scenes/explorer/logic'
import viewsLogic from 'scenes/header/views/logic'

const logic = connect({
  actions: [
    explorerLogic, [
      'openTreeNode',
      'clear',
      'setSearch',
      'addColumn',
      'openUrl'
    ],
    viewsLogic, [
      'openView'
    ]
  ],
  props: [
    explorerLogic, [
      'search',
      'filteredModels',
      'selectedModel',
      'structure',
      'savedViews',
      'modelFavourites',
      'recommendedViews'
    ],
    state => state.router.location, [
      'pathname as urlPath',
      'search as urlSearch'
    ]
  ]
})

class ExplorerTree extends Component {
  openModel = (model) => {
    const { structure } = this.props
    const { openTreeNode, setSearch, addColumn } = this.actions

    openTreeNode(model)
    setSearch('')

    // get the id column for this model
    const primaryKey = structure[model].primary_key

    // and add it with a count as the default
    if (primaryKey) {
      addColumn(`${model}.${primaryKey}!!count`)
    }

    this.focusSearch()
  }

  closeModel = () => {
    const { clear, setSearch } = this.actions

    clear()
    setSearch('')
    this.focusSearch()
  }

  setSearchInputRef = (ref) => {
    this.searchInputRef = ref
    this.focusSearch()
  }

  componentDidMount () {
    this.focusSearch()
  }

  focusSearch = () => {
    this.searchInputRef && this.searchInputRef.focus()
  }

  renderModels = () => {
    const { filteredModels, search } = this.props

    return (
      <div className='model-list'>
        {filteredModels.map(model => (
          <div key={model} onClick={() => this.openModel(model)} className='model-list-item'>
            {search ? <HighlightText highlight={search}>{model}</HighlightText> : model}
          </div>
        ))}
      </div>
    )
  }

  renderSelectedModel = () => {
    const { search, selectedModel, savedViews, recommendedViews, modelFavourites, urlPath, urlSearch } = this.props
    const { openView, openUrl } = this.actions

    const url = urlPath + urlSearch

    return (
      <div>
        <div>
          <Button type='link' icon='close' style={{float: 'right'}} onClick={this.closeModel} />
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
                focusSearch={this.focusSearch} />
            ))}
          </div>
        </div>

        <Node key={selectedModel}
          path={selectedModel}
          localSearch={search}
          model={selectedModel}
          focusSearch={this.focusSearch} />
      </div>
    )
  }

  render () {
    const { search, selectedModel } = this.props
    const { setSearch } = this.actions

    return (
      <Layout>
        <Layout layoutHeight={100}>
          <div>
            <div style={{ padding: 10, paddingBottom: 0 }}>
              <Connection />
            </div>
            <div style={{ padding: 10 }}>
              <Input.Search
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
              this.renderSelectedModel()
            ) : (
              this.renderModels()
            )}
          </div>
        </Layout>
      </Layout>
    )
  }
}

export default logic(ExplorerTree)
