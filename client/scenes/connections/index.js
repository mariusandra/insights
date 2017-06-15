import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components
import Spinner from 'lib/tags/spinner'

// logic
import connections from '~/scenes/connections/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = connections.constants

@connect({
  actions: [
    connections, [
      // 'showAll',
      // 'setVisibilityFilter'
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
              <div>
                You have not configured any connections. Add one below.
                <br />
                <br />
                For now you must still edit the config.js file to connect to your db. Connections editing coming soon!
                <br />
                <br />
                If you installed this via "npm install -g insights", you're temporarily out of luck. Clone the project and edit config.js instead!
              </div>
            ) : sortedConnections.map(connection => (
              <div key={connection._id}>
                Name:
                {connection.name}
                <br />
                Keyword:
                {connection.keyword}
                <br />
                URL:
                {connection.url}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}
