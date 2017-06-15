import Saga from 'kea/saga'
import { put, call } from 'redux-saga/effects'

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

      'removeConnection',
      'connectionRemoved',

      'testConnection'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.addConnection]: this.addConnectionWorker,
    [actions.removeConnection]: this.removeConnectionWorker,
    [actions.testConnection]: this.testConnectionWorker
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
    const { keyword, url } = action.payload
    const connection = yield connectionsService.create({ keyword, url })
    yield put(connectionAdded(connection))
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
    console.log(result)

    if (result.working) {
      messg.success('The connection is working!', 2500)
    } else {
      messg.error(`Error: ${result.error}`, 4000)
    }
  }
}
