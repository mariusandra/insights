import { kea } from 'kea'
import PropTypes from 'prop-types'
import { call, put } from 'redux-saga/effects'
import messg from 'messg'
import { push } from "connected-react-router"

import authLogic from 'scenes/auth'
import client from 'lib/client'

const connectionsService = client.service('connections')
const connectionTestService = client.service('connection-test')

export default kea({
  path: () => ['scenes', 'connections', 'index'],

  actions: ({ constants }) => ({
    loadingConnections: true,
    connectionsLoaded: connections => ({ connections }),

    addConnection: ({ keyword, url, structurePath, timeoutMs }) => ({ keyword, url, structurePath, timeoutMs }),
    connectionAdded: (connection) => ({ connection }),

    editConnection: (id, url, structurePath, timeoutMs) => ({ id, url, structurePath, timeoutMs }),
    connectionEdited: (connection) => ({ connection }),

    viewStructure: (id) => ({ id }),

    testConnection: (id) => ({ id }),

    removeConnection: (id) => ({ id }),
    connectionRemoved: (id) => ({ id }),

    openAddConnection: true,
    closeAddConnection: true,
    openEditConnection: id => ({ id })
  }),

  reducers: ({ actions, constants }) => ({
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
    }],

    isAddOpen: [false, PropTypes.bool, {
      [actions.openAddConnection]: () => true,
      [actions.closeAddConnection]: () => false,
      [actions.connectionAdded]: () => false
    }],

    isEditOpen: [false, PropTypes.bool, {
      [actions.openEditConnection]: () => true
    }],

    editingConnectionId: [null, PropTypes.string, {
      [actions.openEditConnection]: (_, payload) => payload.id
    }]
  }),

  selectors: ({ constants, selectors }) => ({
    sortedConnections: [
      () => [selectors.connections],
      (connections) => Object.values(connections).sort((a, b) => (a.keyword || '').localeCompare(b.keyword || '')),
      PropTypes.array
    ],

    selectedConnection: [
      () => [selectors.sortedConnections],
      (sortedConnections) => sortedConnections[0],
      PropTypes.object
    ],

    otherConnections: [
      () => [selectors.sortedConnections],
      (sortedConnections) => { const [, ...rest] = sortedConnections; return rest },
      PropTypes.array
    ],

    editingConnection: [
      () => [selectors.editingConnectionId, selectors.connections],
      (editingConnectionId, connections) => editingConnectionId ? connections[editingConnectionId] : null,
      PropTypes.object
    ]
  }),

  takeEvery: ({ actions, workers }) => ({
    [actions.addConnection]: workers.addConnection,
    [actions.editConnection]: workers.editConnection,
    [actions.removeConnection]: workers.removeConnection,
    [actions.testConnection]: workers.testConnection,
    [actions.viewStructure]: workers.viewStructure
  }),

  start: function * () {
    const { connectionsLoaded, loadingConnections } = this.actions

    yield call(authLogic.workers.waitUntilLogin)

    yield put(loadingConnections())

    const connections = yield connectionsService.find({})
    yield put(connectionsLoaded(connections.data))
  },

  workers: {
    addConnection: function * (action) {
      const { connectionAdded } = this.actions
      const { keyword, url, structurePath, timeoutMs } = action.payload
      const connection = yield connectionsService.create({ keyword, url, structurePath, timeoutMs })
      yield put(connectionAdded(connection))
    },

    editConnection: function * (action) {
      const { connectionEdited } = this.actions
      const { id, url, structurePath, timeoutMs } = action.payload
      const connection = yield connectionsService.patch(id, { url, structurePath, timeoutMs })
      yield put(connectionEdited(connection))
    },

    removeConnection: function * (action) {
      const { connectionRemoved } = this.actions
      const { id } = action.payload
      yield connectionsService.remove(id)
      yield put(connectionRemoved(id))
    },

    testConnection: function * (action) {
      const { id } = action.payload

      const result = yield connectionTestService.get(id)

      if (result.working) {
        messg.success('The connection is working!', 2500)
      } else {
        messg.error(`Error: ${result.error}`, 4000)
      }
    },

    viewStructure: function * (action) {
      const { id } = action.payload
      yield put(push(`/connections/${id}`))
    }
  }
})
