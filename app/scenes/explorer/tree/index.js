import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'
import { Layout } from 'react-flex-layout'

// utils
import HighlightText from 'lib/utils/highlight-text'

// components
import Node from './node'

// logic
import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'openTreeNode',
      'setSearch'
    ]
  ],
  props: [
    explorerLogic, [
      'search',
      'models',
      'selectedModel'
    ]
  ]
})
export default class ExplorerTree extends Component {
  handleSearch = (e) => {
    const { setSearch } = this.props.actions
    setSearch(e.target.value)
  }

  openModel = (model) => {
    const { openTreeNode, setSearch } = this.props.actions

    openTreeNode(model)
    setSearch('')
    this.refs.search.focus()
  }

  render () {
    const { models, search, selectedModel } = this.props

    return (
      <Layout>
        <Layout layoutHeight={50}>
          <div style={{padding: 10}}>
            <input ref='search'
                   type='search'
                   id='tree-search'
                   autoFocus
                   value={search}
                   className='input-text'
                   onChange={this.handleSearch}
                   style={{width: '100%'}}
                   placeholder='Type to search...' />
          </div>
        </Layout>
        <Layout layoutHeight='flex'>
          <div className='explorer-tree'>
            {selectedModel ? (
              <Node key={selectedModel}
                    path={selectedModel}
                    localSearch={search}
                    model={selectedModel} />
            ) : (
              models.sort().filter(m => !search || m.toLowerCase().includes(search.toLowerCase())).map(model => (
                <div className='node' key={model}>
                  <div className='node-entry'>
                    <div className='node-icon has-children collapsed'
                        onClick={() => this.openModel(model)} />
                    <div className='node-title' onClick={() => this.openModel(model)}>
                      {search ? <HighlightText highlight={search}>{model}</HighlightText> : model}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Layout>
      </Layout>
    )
  }
}
