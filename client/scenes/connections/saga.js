import Saga from 'kea/saga'
import { put, call } from 'redux-saga/effects'

import { waitUntilLogin } from '~/scenes/auth'
import connectionsLogic from '~/scenes/connections/logic'

import client from '~/client'

const connectionsService = client.service('api/connections')

export default class ConnectionsSaga extends Saga {
  actions = () => ([
    connectionsLogic, [
      'loadingConnections',
      'connectionsLoaded'
    ]
  ])

  // takeEvery = ({ actions }) => ({
  //   [actions.doSomething]: this.doSomethingWorker
  // })

  run = function * () {
    const { connectionsLoaded, loadingConnections } = this.actions

    yield call(waitUntilLogin)

    yield put(loadingConnections())

    const connections = yield connectionsService.find({})
    yield put(connectionsLoaded(connections.data))
  }

  // cancelled = function * () {
  //   console.log('Stopping connections saga')
  // }

  // doSomethingWorker = function * (action) {
  //   const { variable } = action.payload
  //   const propertyName = yield Logic.get('propertyName')
  //   console.log('doSomething action called with', variable)
  // }
}
