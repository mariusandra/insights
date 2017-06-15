import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class ConnectionsLogic extends Logic {
  path = () => ['scenes', 'connections', 'index']

  actions = ({ constants }) => ({
    loadingConnections: true,
    connectionsLoaded: connections => ({ connections }),

    addConnection: ({ keyword, url, structurePath }) => ({ keyword, url, structurePath }),
    connectionAdded: (connection) => ({ connection }),

    editConnection: (id, url, structurePath) => ({ id, url, structurePath }),
    connectionEdited: (connection) => ({ connection }),

    testConnection: (id) => ({ id }),

    removeConnection: (id) => ({ id }),
    connectionRemoved: (id) => ({ id })
  })

  reducers = ({ actions, constants }) => ({
    isLoading: [false, PropTypes.bool, {
      [actions.loadingConnections]: () => true,
      [actions.connectionsLoaded]: () => false
    }],

    connections: [{}, PropTypes.object, {
      [actions.connectionsLoaded]: (_, payload) => {
        let newState = {}
        payload.connections.forEach(connection => {
          newState[connection._id] = connection
        })
        return newState
      },
      [actions.connectionAdded]: (state, payload) => {
        return Object.assign({}, state, { [payload.connection._id]: payload.connection })
      },
      [actions.connectionEdited]: (state, payload) => {
        return Object.assign({}, state, { [payload.connection._id]: payload.connection })
      },
      [actions.connectionRemoved]: (state, payload) => {
        const { [payload.id]: discard, ...rest } = state // eslint-disable-line
        return rest
      }
    }]
  })

  selectors = ({ constants, selectors }) => ({
    sortedConnections: [
      () => [selectors.connections],
      (connections) => Object.values(connections).sort((a, b) => a.keyword.localeCompare(b.keyword)),
      PropTypes.array
    ]
  })
}
