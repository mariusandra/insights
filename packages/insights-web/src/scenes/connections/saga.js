import { kea } from 'kea'
import { put, call } from 'redux-saga/effects'
import { push } from 'connected-react-router'

import messg from 'messg'

import authLogic from 'scenes/auth'
import connectionsLogic from 'scenes/connections/logic'

import client from 'lib/client'

const connectionsService = client.service('connections')
const connectionTestService = client.service('connection-test')

export default kea({
  path: () => ['scenes', 'connections', 'saga'],

  connect: {
    actions: [
      connectionsLogic, [
        'loadingConnections',
        'connectionsLoaded',

        'addConnection',
        'connectionAdded',

        'editConnection',
        'connectionEdited',

        'removeConnection',
        'connectionRemoved',

        'testConnection',

        'viewStructure'
      ]
    ]
  },

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
