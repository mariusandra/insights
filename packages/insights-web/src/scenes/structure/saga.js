import { kea } from 'kea'
import { put, call } from 'redux-saga/effects'
import { LOCATION_CHANGE, push } from 'react-router-redux'

import authLogic from 'scenes/auth'

import client from 'lib/client'

import structureLogic from 'scenes/structure/logic'

const connectionsService = client.service('api/connections')
const structureService = client.service('api/structure')

export default kea({
  path: () => ['scenes', 'structure', 'saga'],

  connect: {
    actions: [
      structureLogic, [
        'startLoading',
        'connectionLoaded',
        'structureLoaded',
        'openConnections'
      ]
    ]
  },

  takeEvery: ({ actions, workers }) => ({
    [LOCATION_CHANGE]: workers.setStructureFromUrl,
    [actions.openConnections]: workers.openConnections
  }),

  start: function * () {
    yield call(authLogic.workers.waitUntilLogin)
    yield call(this.workers.setStructureFromUrl)
  },

  workers: {
    setStructureFromUrl: function * (action) {
      const { startLoading, connectionLoaded, structureLoaded } = this.actions

      yield put(startLoading())

      const pathname = window.location.pathname
      const match = pathname.match(/\/connections\/([A-Za-z0-9]+)\/?/)
      const urlConnectionId = match ? match[1] : null

      if (urlConnectionId) {
        const connection = yield connectionsService.get(urlConnectionId)
        const structure = yield structureService.get(urlConnectionId)

        yield put(connectionLoaded(connection))
        yield put(structureLoaded(structure))
      }
    },

    openConnections: function * (action) {
      yield put(push('/connections'))
    }
  }
})
