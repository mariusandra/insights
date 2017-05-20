import Saga from 'kea/saga'
// import { put } from 'redux-saga/effects'

// import headerLogic from '~/scenes/header/logic'

export default class HeaderSaga extends Saga {
  // actions = () => ([
  //   headerLogic, [
  //     'doSomething'
  //   ]
  // ])
  //
  // takeEvery = ({ actions }) => ({
  //   [actions.doSomething]: this.doSomethingWorker
  // })

  run = function * () {
    // const { doSomething } = this.actions

    console.log('Starting header saga')

    // while (true) {
    //   const propertyName = yield headerLogic.get('propertyName')
    //   yield put(doSomething(propertyName + '!'))
    // }
  }

  cancelled = function * () {
    console.log('Stopping header saga')
  }

  // doSomethingWorker = function * (action) {
  //   const { variable } = action.payload
  //   console.log('doSomething action called with', variable)
  // }
}
