import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components
import Spinner from 'lib/tags/spinner'
import AddConnection from './add-connection'

// logic
import connections from '~/scenes/connections/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = connections.constants

@connect({
  actions: [
    connections, [
      'removeConnection',
      'testConnection'
    ]
  ],
  props: [
    connections, [
      'isLoading',
      'sortedConnections'
    ]
  ]
})
export default class ConnectionsScene extends Component {
  handleRemove = (e, id) => {
    const { removeConnection } = this.props.actions
    e.preventDefault()
    if (window.prompt('Are you sure?')) {
      removeConnection(id)
    }
  }

  handleTest = (e, id) => {
    const { testConnection } = this.props.actions
    e.preventDefault()
    testConnection(id)
  }

  render () {
    const { isLoading, sortedConnections } = this.props

    return (
      <div className='connections-scene'>
        {isLoading ? (
          <div>
            <Spinner />
          </div>
        ) : (
          <div>
            {sortedConnections.length === 0 ? (
              <div style={{marginBottom: 20}}>
                You have not configured any connections. Add one below.
              </div>
            ) : sortedConnections.map(connection => (
              <div key={connection._id} style={{marginBottom: 20}}>
                <h3>{connection.keyword}</h3>
                Keyword:
                {' '}
                {connection.keyword}
                <br />
                URL:
                {' '}
                {connection.url}
                <br />
                <br />
                Actions:
                {' '}
                <a href='#' onClick={(e) => this.handleRemove(e, connection._id)}>Remove</a>
                {' | '}
                <a href='#' onClick={(e) => this.handleTest(e, connection._id)}>Test connection</a>
              </div>
            ))}
            <AddConnection />
          </div>
        )}
      </div>
    )
  }
}
