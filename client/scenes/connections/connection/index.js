import React, { Component } from 'react'
import { connect } from 'kea/logic'

import messg from 'messg'

import connectionsLogic from '~/scenes/connections/logic'

@connect({
  actions: [
    connectionsLogic, [
      'editConnection',
      'testConnection',
      'removeConnection'
    ]
  ]
})
export default class Connection extends Component {
  constructor (props) {
    super(props)

    this.state = {
      url: props.connection.url,
      editing: false
    }
  }

  handleUpdate = (e) => {
    const { connection } = this.props
    const { editConnection } = this.props.actions
    const { url } = this.state

    e.preventDefault()

    if (!url) {
      messg.error('You must enter a url', 2500)
      return
    }

    editConnection(connection._id, url)

    this.setState({ editing: false })
  }

  handleCancel = () => {
    this.setState({ editing: false, url: this.props.connection.url })
  }

  handleEdit = (e) => {
    e.preventDefault()
    this.setState({ editing: true, url: this.props.connection.url })
  }

  handleRemove = (e, id) => {
    const { removeConnection } = this.props.actions
    e.preventDefault()
    if (window.confirm('Are you sure?')) {
      removeConnection(id)
    }
  }

  handleTest = (e, id) => {
    const { testConnection } = this.props.actions
    e.preventDefault()
    testConnection(id)
  }

  render () {
    const { connection } = this.props
    const { editing, url } = this.state

    return (
      <div key={connection._id} style={{marginBottom: 20}}>
        <h3>{connection.keyword}</h3>
        {editing ? (
          <div>
            <input placeholder='psql://user:pass@localhost/dbname' value={url} onChange={e => this.setState({ url: e.target.value })} className='input-text' style={{width: 400}} />
            <button type='button' onClick={this.handleUpdate}>Save</button>
            <button type='button' onClick={this.handleCancel} className='white'>Cancel</button>
          </div>
        ) : (
          <div>
            {connection.url}
            {' '}
            <a href='#' onClick={this.handleEdit}>Edit</a>
          </div>
        )}
        <br />
        Actions:
        {' '}
        <a href='#' onClick={(e) => this.handleRemove(e, connection._id)}>Remove</a>
        {' | '}
        <a href='#' onClick={(e) => this.handleTest(e, connection._id)}>Test connection</a>
      </div>
    )
  }
}
