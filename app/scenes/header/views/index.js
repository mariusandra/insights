import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils
import Tooltip from 'rc-tooltip'

// components

// logic
import viewsLogic from '~/scenes/header/views/logic'

@connect({
  actions: [
    viewsLogic, [
      'setNewName',
      'openNew',
      'saveView',
      'cancelNew',
      'openView'
    ]
  ],
  props: [
    viewsLogic, [
      'newName',
      'newOpen',
      'sortedViews'
    ]
  ]
})
export default class Views extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tooltipHover: false
    }
  }

  handleTooltip = (tooltipHover) => {
    this.setState({ tooltipHover })
  }

  saveView = (e) => {
    const { saveView } = this.props.actions
    e.preventDefault()
    saveView()
  }

  openView = (id) => {
    const { openView } = this.props.actions
    openView(id)
  }

  render () {
    const { newName, sortedViews, newOpen } = this.props
    const { setNewName, openNew, cancelNew } = this.props.actions

    const overlay = (
      <div className='views-menu'>
        {newOpen ? (
          <form onSubmit={this.saveView}>
            <input className='input-text full'
                   placeholder='Enter a title'
                   onChange={e => setNewName(e.target.value)}
                   value={newName}
                   autoFocus />
            <button className='save' onClick={this.saveView}>✔</button>
            <button className='cancel' onClick={cancelNew}>✕</button>
          </form>
        ) : (
          <div className='buttons'>
            <span className='open-new' onClick={openNew}>Save this page</span>
          </div>
        )}
        <div className='list'>
          {sortedViews.map(view => (
            <div key={view.id} className='list-item' onClick={() => this.openView(view.id)}>
              {view.name}
            </div>
          ))}
        </div>
      </div>
    )

    return (
      <div className='tab-row-element'>
        <Tooltip placement='bottomLeft' trigger={['hover']} overlay={overlay} onVisibleChange={this.handleTooltip}>
          <button>Saved Views</button>
        </Tooltip>
      </div>
    )
  }
}
