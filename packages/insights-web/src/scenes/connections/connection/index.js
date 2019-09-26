import React, { Component } from 'react'
import { connect } from 'kea'

import messg from 'messg'

import deletePopup from 'lib/popups/delete'

import connectionsLogic from 'scenes/connections/logic'

const logic = connect({
  actions: [
    connectionsLogic, [
      'editConnection',
      'testConnection',
      'removeConnection',
      'viewStructure'
    ]
  ]
})

class Connection extends Component {
  constructor (props) {
    super(props)

    this.state = {
      url: props.connection.url,
      structurePath: props.connection.structurePath,
      editing: false
    }
  }

  handleUpdate = (e) => {
    const { connection } = this.props
    const { editConnection } = this.actions
    const { url, structurePath } = this.state

    e.preventDefault()

    if (!url) {
      messg.error('You must enter a url', 2500)
      return
    }

    editConnection(connection._id, url, structurePath)

    this.setState({ editing: false })
  }

  handleCancel = () => {
    const { url, structurePath } = this.props.connection
    this.setState({ editing: false, url, structurePath })
  }

  handleEdit = (e) => {
    const { url, structurePath } = this.props.connection
    e.preventDefault()
    this.setState({ editing: true, url, structurePath })
  }

  handleDelete = (e, connection) => {
    const { removeConnection } = this.actions
    const { _id, keyword } = connection
    e.preventDefault()

    deletePopup(`Are you sure you want to delete the connection "${keyword}"?`).then(() => {
      removeConnection(_id)
    })
  }

  handleTest = (e, id) => {
    const { testConnection } = this.actions
    e.preventDefault()
    testConnection(id)
  }

  handleViewStructure = (e, id) => {
    const { viewStructure } = this.actions
    e.preventDefault()
    viewStructure(id)
  }

  render () {
    const { connection } = this.props
    const { editing, url, structurePath } = this.state

    return (
      <div key={connection._id} className='one-connection'>
        <h3>{connection.keyword}</h3>
        {editing ? (
          <div>
            <br />
            <div className='details-edit-line'>
              <strong>connection url</strong>
              <br />
              <input placeholder='psql://user:pass@localhost/dbname' value={url} onChange={e => this.setState({ url: e.target.value })} className='input-text' style={{width: 400}} />
            </div>
            <div className='details-edit-line'>
              <strong>insights.yml path</strong>
              <br />
              <input placeholder='insights.yml path' value={structurePath} onChange={e => this.setState({ structurePath: e.target.value })} className='input-text' style={{width: 400}} />
            </div>
            <button type='button' onClick={this.handleUpdate}>Save</button>
            {' '}
            <button type='button' onClick={this.handleCancel} className='white'>Cancel</button>
          </div>
        ) : (
          <div>
            <div className='details-line'>
              <small>connection url:</small>
              <span>{connection.url}</span>
            </div>
            {connection.structurePath ? (
              <div className='details-line'>
                <small>insights.yml path:</small>
                <span>{connection.structurePath}</span>
              </div>
            ) : null}
            <br />
            Actions:
            {' '}
            <a href='#' onClick={(e) => this.handleDelete(e, connection)}>Delete</a>
            {' | '}
            <a href='#' onClick={this.handleEdit}>Edit</a>
            {' | '}
            <a href='#' onClick={(e) => this.handleTest(e, connection._id)}>Test connection</a>
            {' | '}
            <a href={`/connections/${connection._id}`} onClick={(e) => this.handleViewStructure(e, connection._id)}>View structure</a>
          </div>
        )}
      </div>
    )
  }
}

export default logic(Connection)