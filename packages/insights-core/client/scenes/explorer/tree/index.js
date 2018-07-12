import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'
import { Layout } from 'react-flex-layout'

// utils
import HighlightText from 'lib/utils/highlight-text'
import { InputGroup } from "@blueprintjs/core"

// components
import Node from './node'
import Connection from './connection'

// logic
import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'openTreeNode',
      'setSearch',
      'addColumn'
    ]
  ],
  props: [
    explorerLogic, [
      'search',
      'models',
      'selectedModel',
      'connections',
      'structure'
    ]
  ]
})
export default class ExplorerTree extends Component {
  handleSearch = (e) => {
    const { setSearch } = this.props.actions
    setSearch(e.target.value)
  }

  openModel = (model) => {
    const { structure } = this.props
    const { openTreeNode, setSearch, addColumn } = this.props.actions

    openTreeNode(model)
    setSearch('')

    // get the id column for this model
    const primaryKey = structure[model].primary_key

    // and add it with a count as the default
    if (primaryKey) {
      addColumn(`${model}.${primaryKey}!!count`)
    }

    this.searchInputRef && this.searchInputRef.focus()
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

  render () {
    const { models, search, selectedModel, connections } = this.props

    const showConnections = Object.keys(connections).length > 1

    return (
      <Layout>
        <Layout layoutHeight={showConnections ? 90 : 50}>
          <div>
            {showConnections ? <Connection /> : null}
            <div style={{ padding: 10 }}>
              <InputGroup
                placeholder='Type to search...'
                type='search'
                leftIcon='search'
                inputRef={this.setSearchInputRef}
                value={search}
                onChange={this.handleSearch}
              />
            </div>
          </div>
        </Layout>
        <Layout layoutHeight='flex'>
          <div className='explorer-tree'>
            {selectedModel ? (
              <Node key={selectedModel}
                path={selectedModel}
                localSearch={search}
                model={selectedModel}
                focusSearch={this.focusSearch} />
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
