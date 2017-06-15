import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class ConnectionsLogic extends Logic {
  path = () => ['scenes', 'connections', 'index']

  actions = ({ constants }) => ({
    loadingConnections: true,
    connectionsLoaded: connections => ({ connections }),
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
      }
    }]
  })

  selectors = ({ constants, selectors }) => ({
    sortedConnections: [
      () => [selectors.connections],
      (connections) => Object.values(connections).sort((a, b) => a.name.localeCompare(b.name)),
      PropTypes.array
    ]
  })
}
