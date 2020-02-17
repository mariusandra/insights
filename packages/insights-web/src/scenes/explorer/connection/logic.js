import { kea } from 'kea'
import PropTypes from 'prop-types'
import { message, Modal } from 'antd'

import client from 'lib/client'
import urlToState from '../../../lib/explorer/url-to-state'

const connectionsService = client.service('connections')
const connectionTestService = client.service('connection-test')
const subsetsService = client.service('subsets')
const structureService = client.service('structure')

export default kea({
  path: () => ['scenes', 'connections', 'index'],

  actions: () => ({
    loadConnections: (initialLoad = false) => ({ initialLoad }),
    setConnections: (connections, initialLoad) => ({ connections, initialLoad }),
    setConnectionId: (connectionId, subsetId) => ({ connectionId, subsetId }),

    loadSubsets: connectionId => ({ connectionId }),
    setSubsets: (subsets, connectionId) => ({ subsets, connectionId }),

    loadStructure: (connectionId, subsetId) => ({ connectionId, subsetId }),
    setStructure: structure => ({ structure }),

    addConnection: ({ name, url, structurePath, timeout, timezone }) => ({ name, url, structurePath, timeout, timezone }),
    connectionAdded: (connection) => ({ connection }),

    editConnection: (id, name, url, structurePath, timeout, timezone) => ({ id, name, url, structurePath, timeout, timezone }),
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

    newSubset: true,
    editSubset: true,
    closeSubset: true,
    subsetEdited: subset => ({ subset }),
    subsetRemoved: subsetId => ({ subsetId }),
    fullSubsetLoaded: (subset, structure) => ({ subset, structure })
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

    subsetsLoadedForConnectionId: [null, PropTypes.string, {
      [actions.setSubsets]: (_, payload) => payload.connectionId,
      [actions.subsetRemoved]: () => null
    }],

    subsets: [{}, PropTypes.object, {
      [actions.setSubsets]: (_, payload) => {
        let newState = {}
        payload.subsets.forEach(subset => {
          newState[subset._id] = subset
        })
        return newState
      },
      [actions.subsetEdited]: (state, { subset }) => ({
        ...state,
        [subset._id]: { _id: subset._id, name: subset.name, type: subset.type, connectionId: subset.connectionId }
      }),
      [actions.subsetRemoved]: (state, { subsetId }) => {
        const { [subsetId]: _discard, ...rest } = state
        return rest
      }
    }],

    subsetId: [null, PropTypes.string, {
      [actions.setConnectionId]: (_, payload) => payload.subsetId || null
    }],

    structure: [{}, {
      [actions.setConnectionId]: () => ({}),
      [actions.setStructure]: (_, { structure }) => structure
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
      [actions.newSubset]: () => true,
      [actions.editSubset]: () => true,
      [actions.closeSubset]: () => false
    }],

    subset: [null, PropTypes.object, {
      [actions.newSubset]: () => null,
      [actions.editSubset]: () => null,
      [actions.fullSubsetLoaded]: (_, payload) => payload.subset,
    }],

    subsetStructureInput: [{}, PropTypes.object, {
      [actions.newSubset]: () => ({}),
      [actions.editSubset]: () => ({}),
      [actions.fullSubsetLoaded]: (_, payload) => payload.structure,
    }]
  }),

  selectors: ({ constants, selectors }) => ({
    connectionString: [
      () => [selectors.connectionId, selectors.subsetId],
      (connectionId, subsetId) => connectionId ? (subsetId ? `${connectionId}--${subsetId}` : connectionId) : ''
    ],

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
    ],

    sortedSubsets: [
      () => [selectors.subsets],
      (subsets) => Object.values(subsets).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      PropTypes.array
    ],

    selectedSubset: [
      () => [selectors.sortedSubsets, selectors.subsetId],
      (sortedSubsets, subsetId) => sortedSubsets.filter(c => c._id === subsetId)[0],
      PropTypes.object
    ],

    otherSubsets: [
      () => [selectors.sortedSubsets, selectors.subsetId],
      (sortedSubsets, subsetId) => sortedSubsets.filter(c => c._id !== subsetId),
      PropTypes.array
    ],
  }),

  events: ({ actions }) => ({
    afterMount: () => {
      actions.loadConnections(true)
    }
  }),

  listeners: ({ actions, values }) => ({
    [actions.setConnectionId]: async function ({ connectionId, subsetId }) {
      if (connectionId && values.subsetsLoadedForConnectionId !== connectionId) {
        actions.loadSubsets(connectionId)
      }

      if (connectionId && subsetId) {
        actions.loadStructure(connectionId, subsetId)
      }
    },

    [actions.loadConnections]: async function ({ initialLoad }, breakpoint) {
      const connections = await connectionsService.find({})
      breakpoint()
      actions.setConnections(connections, initialLoad)
    },

    [actions.setConnections]: async function ({ connections, initialLoad }) {
      if (initialLoad && connections.length === 0) {
        actions.openAddConnection(true)
      }

      if (initialLoad && connections.length === 1) {
        const path = `${window.location.pathname}${window.location.search}`
        const values = urlToState(path)
        if (!values.connection || values.connection === '--') {
          actions.setConnectionId(connections[0]._id)
        }
      }
    },

    [actions.loadSubsets]: async function ({ connectionId }, breakpoint) {
      if (!connectionId || values.subsetsLoadedForConnectionId === connectionId) {
        return
      }

      const subsets = await subsetsService.find({
        query: {
          connectionId,
          $select: ['_id', 'name', 'type', 'connectionId']
        }
      })
      breakpoint()
      actions.setSubsets(subsets, connectionId)

      if (!values.subsetId) {
        if (subsets.length === 0) {
          actions.setConnectionId(connectionId, '')
        } else {
          const firstSubset = subsets.filter(s => s.type === 'all_data').concat(subsets.filter(s => s.type !== 'all_data'))[0]
          actions.setConnectionId(connectionId, firstSubset ? firstSubset._id : '')
        }
      }
    },

    [actions.loadStructure]: async function ({ connectionId, subsetId }, breakpoint) {
      if (!connectionId) {
        if (Object.keys(values.structure).length > 0) {
          actions.setStructure({})
        }
        return
      }

      try {
        const structure = await structureService.get(connectionId, { query: { subsetId } })
        breakpoint()
        actions.setStructure(structure)
      } catch (e) {
        if (e.message === 'kea-listeners breakpoint broke') {
          return
        }
        message.error(`Unable to load database structure for connection "${connectionId}--${subsetId}"!`)
        actions.setStructure({})
      }
    },

    [actions.addConnection]: async function ({ name, url, structurePath, timeout, timezone }) {
      const connection = await connectionsService.create({ name, url, structurePath, timeout, timezone })
      actions.connectionAdded(connection)
      actions.setConnectionId(connection._id)
      message.success(`Connection "${name}" added!`)
    },

    [actions.editConnection]: async function ({ id, name, url, structurePath, timeout, timezone }) {
      const connection = await connectionsService.patch(id, { name, url, structurePath, timeout, timezone })
      actions.connectionEdited(connection)
      message.success('Changes saved!')
    },

    [actions.confirmRemoveConnection]: async function ({ id }) {
      Modal.confirm({
        title: `Delete the connection "${values.selectedConnection.name}"?`,
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
    },

    [actions.newSubset]: async function (_, breakpoint) {
      const { connectionId } = values

      const structure = await structureService.get(connectionId, { query: { getInputStructure: true } })
      breakpoint()
      const emptySubset = {
        connectionId,
        type: 'custom',
        name: '',
        addNewModels: false,
        addNewFields: false,
        selection: {}
      }
      actions.fullSubsetLoaded(emptySubset, structure)
    },

    [actions.editSubset]: async function (_, breakpoint) {
      const { subsetId, connectionId } = values

      let [subset, structure] = await Promise.all([
        subsetsService.get(subsetId),
        structureService.get(connectionId, { query: { subsetId, getInputStructure: true } })
      ]);
      breakpoint()

      actions.fullSubsetLoaded(subset, structure)
    }
  })
})
