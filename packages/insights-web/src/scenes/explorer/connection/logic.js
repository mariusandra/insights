import { kea } from 'kea'
import PropTypes from 'prop-types'
import { message, Modal } from 'antd'

import client from 'lib/client'

const connectionsService = client.service('connections')
const connectionTestService = client.service('connection-test')
const subsetsService = client.service('subsets')

export default kea({
  path: () => ['scenes', 'connections', 'index'],

  actions: () => ({
    loadConnections: true,
    setConnections: connections => ({ connections }),
    setConnectionId: connectionId => ({ connectionId }),

    loadSubsets: connectionId => ({ connectionId }),
    setSubsets: subsets => ({ subsets }),
    setSubsetId: subsetId => ({ subsetId }),

    addConnection: ({ name, url, structurePath, timeout }) => ({ name, url, structurePath, timeout }),
    connectionAdded: (connection) => ({ connection }),

    editConnection: (id, name, url, structurePath, timeout) => ({ id, name, url, structurePath, timeout }),
    connectionEdited: (connection) => ({ connection }),

    testConnection: (url, structurePath) => ({ url, structurePath }),
    testSuccess: true,
    testFailure: true,

    openAddConnection: (introMessage = false) => ({ introMessage }),
    confirmRemoveConnection: (id) => ({ id }),
    removeConnection: (id) => ({ id }),
    connectionRemoved: (id) => ({ id }),

    closeConnection: true,
    openEditConnection: id => ({ id }),

    openSubset: true,
    closeSubset: true
  }),

  reducers: ({ actions }) => ({
    isLoadingConnections: [false, PropTypes.bool, {
      [actions.loadConnections]: () => true,
      [actions.setConnections]: () => false,
    }],

    isLoadingSubsets: [false, PropTypes.bool, {
      [actions.loadConnections]: () => true,
      [actions.loadSubsets]: () => true,
      [actions.setSubsets]: () => false
    }],

    connections: [{}, PropTypes.object, {
      [actions.setConnections]: (_, payload) => {
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

    connectionId: [null, PropTypes.string, {
      [actions.setConnectionId]: (_, payload) => payload.connectionId
    }],

    subsets: [{}, PropTypes.object, {
      [actions.setConnectionId]: () => ({}),
      [actions.setSubsets]: (_, payload) => {
        let newState = {}
        payload.subsets.forEach(subset => {
          newState[subset._id] = subset
        })
        return newState
      },
    }],

    subsetId: [null, PropTypes.string, {
      [actions.setConnectionId]: () => null,
      [actions.setSubsetId]: (_, payload) => payload.subsetId
    }],

    addIntroMessage: [false, PropTypes.bool, {
      [actions.openAddConnection]: (_, payload) => payload.introMessage
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

    didTest: [false, PropTypes.bool, {
      [actions.openAddConnection]: () => false,
      [actions.openEditConnection]: () => false,
      [actions.testConnection]: (_, { url }) => !!url
    }],

    isTesting: [false, PropTypes.bool, {
      [actions.openAddConnection]: () => false,
      [actions.openEditConnection]: () => false,
      [actions.testConnection]: () => true,
      [actions.testSuccess]: () => false,
      [actions.testFailure]: () => false
    }],

    testPassed: [false, PropTypes.bool, {
      [actions.testConnection]: () => false,
      [actions.testSuccess]: () => true,
      [actions.testFailure]: () => false
    }],

    editingConnectionId: [null, PropTypes.string, {
      [actions.openEditConnection]: (_, payload) => payload.id
    }],

    isSubsetOpen: [false, PropTypes.bool, {
      [actions.openSubset]: () => true,
      [actions.closeSubset]: () => false
    }]
  }),

  selectors: ({ constants, selectors }) => ({
    sortedConnections: [
      () => [selectors.connections],
      (connections) => Object.values(connections).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      PropTypes.array
    ],

    selectedConnection: [
      () => [selectors.sortedConnections, selectors.connectionId],
      (sortedConnections, connectionId) => sortedConnections.filter(c => c._id === connectionId)[0],
      PropTypes.object
    ],

    otherConnections: [
      () => [selectors.sortedConnections, selectors.connectionId],
      (sortedConnections, connectionId) => sortedConnections.filter(c => c._id !== connectionId),
      PropTypes.array
    ],

    editingConnection: [
      () => [selectors.editingConnectionId, selectors.connections],
      (editingConnectionId, connections) => editingConnectionId ? connections[editingConnectionId] : null,
      PropTypes.object
    ]
  }),

  events: ({ actions }) => ({
    afterMount: () => {
      actions.loadConnections()
    }
  }),

  listeners: ({ actions, sharedListeners }) => ({
    [actions.loadConnections]: async function () {
      const connections = await connectionsService.find({})
      actions.setConnections(connections)
    },

    [actions.setConnectionId]: async function ({ connectionId }) {
      actions.loadSubsets(connectionId)
    },

    [actions.loadSubsets]: async function ({ connectionId }, breakpoint) {
      const subsets = await subsetsService.find({ query: { connectionId } })
      breakpoint()
      actions.setSubsets(subsets)
    },

    [actions.addConnection]: async function ({ name, url, structurePath, timeout }) {
      const connection = await connectionsService.create({ name, url, structurePath, timeout })
      actions.connectionAdded(connection)
      actions.setConnectionId(connection._id)
      message.success(`Connection "${name}" added!`)
    },

    [actions.editConnection]: async function ({ id, name, url, structurePath, timeout }) {
      const connection = await connectionsService.patch(id, { name, url, structurePath, timeout })
      actions.connectionEdited(connection)
      message.success('Changes saved!')
    },

    [actions.confirmRemoveConnection]: async function ({ id }) {
      Modal.confirm({
        title: 'Are you sure delete this connection?',
        content: 'This can not be undone!',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk () {
          actions.removeConnection(id)
        }
      })
    },

    [actions.removeConnection]: async function ({ id }) {
      await connectionsService.remove(id)
      actions.connectionRemoved(id)
      actions.setConnectionId('')
    },

    [actions.testConnection]: async function ({ url, structurePath }) {
      if (url) {
        try {
          const result = await connectionTestService.find({query: {url, structurePath}})

          if (result.working) {
            actions.testSuccess()
          } else {
            actions.testFailure()
          }
        } catch (e) {
          actions.testFailure()
        }
      } else {
        actions.testFailure()
      }
    }
  })
})
