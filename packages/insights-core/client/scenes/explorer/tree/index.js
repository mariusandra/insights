import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'
import { Layout } from 'react-flex-layout'

// utils
import HighlightText from 'lib/utils/highlight-text'
import { H4, Button, InputGroup, Menu, MenuItem } from "@blueprintjs/core"

// components
import Node from './node'
import Connection from './connection'

// logic
import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'openTreeNode',
      'clear',
      'setSearch',
      'addColumn'
    ]
  ],
  props: [
    explorerLogic, [
      'search',
      'filteredModels',
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

    this.focusSearch()
  }

  closeModel = () => {
    const { clear, setSearch } = this.props.actions

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
      <Menu>
        {filteredModels.map(model => (
          <MenuItem
            key={model}
            onClick={() => this.openModel(model)}
            text={search ? <HighlightText highlight={search}>{model}</HighlightText> : model} />
        ))}
      </Menu>
    )
  }

  renderSelectedModel = () => {
    const { search, selectedModel } = this.props

    return (
      <div>
        <div>
          <Button minimal icon='cross' style={{float: 'right'}} onClick={this.closeModel} />
          <H4 style={{lineHeight: '30px'}}>{selectedModel}</H4>
        </div>

        <div className='node' style={{marginBottom: 10}}>
          <div className='node-entry'>
            <div className='node-icon has-children open' />
            <div className='node-title'>
              Saved views (0)
            </div>
          </div>
        </div>

        <div className='node' style={{marginBottom: 10}}>
          <div className='node-entry'>
            <div className='node-icon has-children open' />
            <div className='node-title'>
              Favourites (0)
            </div>
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
    const { search, selectedModel, connections } = this.props

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
