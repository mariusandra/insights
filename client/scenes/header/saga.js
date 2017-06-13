import Saga from 'kea/saga'
import { put } from 'redux-saga/effects'
import { push } from 'react-router-redux'

import headerLogic from '~/scenes/header/logic'

export default class HeaderSaga extends Saga {
  actions = () => ([
    headerLogic, [
      'openLocation'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.openLocation]: this.openLocationWorker
  })

  openLocationWorker = function * (action) {
    const { location } = action.payload
    yield put(push(location))
  }
}
