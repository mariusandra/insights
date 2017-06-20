import Saga from 'kea/saga'
import { put, call } from 'redux-saga/effects'
import { push } from 'react-router-redux'

import messg from 'messg'

import { waitUntilLogin } from '~/scenes/auth'
import connectionsLogic from '~/scenes/connections/logic'

import client from '~/client'

const connectionsService = client.service('api/connections')
const connectionTestService = client.service('api/connection-test')

export default class ConnectionsSaga extends Saga {
  actions = () => ([
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
  ])

  takeEvery = ({ actions }) => ({
    [actions.addConnection]: this.addConnectionWorker,
    [actions.editConnection]: this.editConnectionWorker,
    [actions.removeConnection]: this.removeConnectionWorker,
    [actions.testConnection]: this.testConnectionWorker,
    [actions.viewStructure]: this.viewStructureWorker
  })

  run = function * () {
    const { connectionsLoaded, loadingConnections } = this.actions

    yield call(waitUntilLogin)

    yield put(loadingConnections())

    const connections = yield connectionsService.find({})
    yield put(connectionsLoaded(connections.data))
  }

  addConnectionWorker = function * (action) {
    const { connectionAdded } = this.actions
    const { keyword, url, structurePath } = action.payload
    const connection = yield connectionsService.create({ keyword, url, structurePath })
    yield put(connectionAdded(connection))
  }

  editConnectionWorker = function * (action) {
    const { connectionEdited } = this.actions
    const { id, url, structurePath } = action.payload
    const connection = yield connectionsService.patch(id, { url, structurePath })
    yield put(connectionEdited(connection))
  }

  removeConnectionWorker = function * (action) {
    const { connectionRemoved } = this.actions
    const { id } = action.payload
    yield connectionsService.remove(id)
    yield put(connectionRemoved(id))
  }

  testConnectionWorker = function * (action) {
    const { id } = action.payload

    const result = yield connectionTestService.get(id)

    if (result.working) {
      messg.success('The connection is working!', 2500)
    } else {
      messg.error(`Error: ${result.error}`, 4000)
    }
  }

  viewStructureWorker = function * (action) {
    const { id } = action.payload
    yield put(push(`/connections/${id}`))
  }
}
