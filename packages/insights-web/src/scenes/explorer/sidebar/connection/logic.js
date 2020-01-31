import { kea } from 'kea'
import PropTypes from 'prop-types'
import { call, put } from 'redux-saga/effects'
import { message } from 'antd'
import { push } from "connected-react-router"

import authLogic from 'scenes/auth'
import explorerLogic from '../../logic'
import client from 'lib/client'

const connectionsService = client.service('connections')
const connectionTestService = client.service('connection-test')

export default kea({
  path: () => ['scenes', 'connections', 'index'],

  connect: {
    values: [
      explorerLogic, ['connection']
    ]
  },

  actions: () => ({
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
    closeConnection: true,
    openEditConnection: id => ({ id })
  }),

  reducers: ({ actions }) => ({
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
      [actions.closeConnection]: () => false,
      [actions.connectionAdded]: () => false,
      [actions.openEditConnection]: () => false
    }],

    isEditOpen: [false, PropTypes.bool, {
      [actions.openAddConnection]: () => false,
      [actions.openEditConnection]: () => true,
      [actions.closeConnection]: () => false,
      [actions.connectionEdited]: () => false,
      [actions.connectionRemoved]: () => false
    }],

    isSaving: [false, PropTypes.bool, {
      [actions.openAddConnection]: () => false,
      [actions.openEditConnection]: () => false,
      [actions.addConnection]: () => true,
      [actions.editConnection]: () => true,
      [actions.removeConnection]: () => true,
      [actions.connectionAdded]: () => false,
      [actions.connectionEdited]: () => false,
      [actions.connectionRemoved]: () => false
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
      () => [selectors.sortedConnections, selectors.connection],
      (sortedConnections, connection) => sortedConnections.filter(c => c.keyword === connection)[0],
      PropTypes.object
    ],

    otherConnections: [
      () => [selectors.sortedConnections, selectors.connection],
      (sortedConnections, connection) => sortedConnections.filter(c => c.keyword !== connection),
      PropTypes.array
    ],

    editingConnection: [
      () => [selectors.editingConnectionId, selectors.connections],
      (editingConnectionId, connections) => editingConnectionId ? connections[editingConnectionId] : null,
      PropTypes.object
    ]
  }),

  start: function * () {
    const { connectionsLoaded, loadingConnections } = this.actions

    yield call(authLogic.workers.waitUntilLogin)

    yield put(loadingConnections())

    const connections = yield connectionsService.find({})
    yield put(connectionsLoaded(connections.data))
  },

  listeners: ({ actions, dispatch }) => ({
    [actions.addConnection]: async function ({ keyword, url, structurePath, timeoutMs }) {
      const connection = await connectionsService.create({ keyword, url, structurePath, timeoutMs })
      actions.connectionAdded(connection)
      message.success(`Connection "${keyword}" added!`);
    },

    [actions.editConnection]: async function ({ id, url, structurePath, timeoutMs }) {
      const connection = await connectionsService.patch(id, { url, structurePath, timeoutMs })
      actions.connectionEdited(connection)
      message.success('Changes saved!');
    },

    [actions.removeConnection]: async function ({ id }) {
      await connectionsService.remove(id)
      actions.connectionRemoved(id)
    },

    [actions.testConnection]: async function ({ id }) {
      const result = await connectionTestService.get(id)

      if (result.working) {
        message.success('The connection is working!')
      } else {
        message.error(`Error: ${result.error}`)
      }
    },

    [actions.viewStructure]: async function ({ id }) {
      dispatch(push(`/connections/${id}`))
    }
  })
})
