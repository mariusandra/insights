import './styles.scss'

import React from 'react'
import { useMountedLogic, useValues } from 'kea'

import Spinner from 'lib/tags/spinner'
import Connection from './connection'
import AddConnection from './add-connection'

import connections from 'scenes/connections/logic'
import sceneSaga from 'scenes/connections/saga'

export default function ConnectionsScene () {
  useMountedLogic(sceneSaga)

  const { isLoading, sortedConnections } = useValues(connections)

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
            <Connection key={connection._id} connection={connection} />
          ))}
          <AddConnection />
        </div>
      )}
    </div>
  )
}
