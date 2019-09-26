import { kea } from 'kea'
import { put } from 'redux-saga/effects'
import { push } from 'connected-react-router'

import headerLogic from 'scenes/header/logic'

export default kea({
  path: () => ['scenes', 'header', 'saga'],

  connect: {
    actions: [
      headerLogic, [
        'openLocation'
      ]
    ]
  },

  takeEvery: ({ actions, workers }) => ({
    [actions.openLocation]: function * (action) {
      const { location } = action.payload
      yield put(push(location))
    }
  })
})
