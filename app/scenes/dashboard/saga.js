import Saga from 'kea/saga'
// import { put } from 'redux-saga/effects'

// import dashboardLogic from '~/scenes/dashboard/logic'

export default class DashboardSaga extends Saga {
  // actions = () => ([
  //   dashboardLogic, [
  //     'doSomething'
  //   ]
  // ])

  // takeEvery = ({ actions }) => ({
  //   [actions.doSomething]: this.doSomethingWorker
  // })

  // run = function * () {
  //   const { doSomething } = this.actions
  //
  //   console.log('Starting dashboard saga')
  //
  //   while (true) {
  //     const propertyName = yield dashboardLogic.get('propertyName')
  //     yield put(doSomething(propertyName + '!'))
  //   }
  // }

  // cancelled = function * () {
  //   console.log('Stopping dashboard saga')
  // }

  // doSomethingWorker = function * (action) {
  //   const { variable } = action.payload
  //   const propertyName = yield Logic.get('propertyName')
  //   console.log('doSomething action called with', variable)
  // }
}
