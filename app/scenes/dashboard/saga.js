import { put, fork } from 'redux-saga/effects'
import Saga from 'kea/saga'

import messg from 'messg'

import dashboardLogic from '~/scenes/dashboard/logic'

import dashboardController from '~/scenes/dashboard/controller.rb'

export default class DashboardSaga extends Saga {
  actions = () => ([
    dashboardLogic, [
      'dashboardsLoaded',
      'selectDashboard',
      'setLayout',
      'addDashboard'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.addDashboard]: this.addDashboardWorker,
    [actions.dashboardsLoaded]: this.dashboardsLoadedWorker
  })

  run = function * () {
    yield fork(this.loadDashboards)
  }

  loadDashboards = function * (action) {
    const { dashboardsLoaded } = this.actions

    const { dashboards } = yield dashboardController.getDashboards({})
    yield put(dashboardsLoaded(dashboards))
  }

  dashboardsLoadedWorker = function * (action) {
    const { selectDashboard, setLayout } = this.actions
    const { dashboards } = action.payload

    const selectedDashboardId = yield dashboardLogic.get('selectedDashboardId')
    if (selectedDashboardId === null && Object.keys(dashboards).length > 0) {
      const firstDashboard = Object.values(dashboards)[0]
      yield put(selectDashboard(firstDashboard.id))
      yield put(setLayout(firstDashboard.layout))
    }
  }

  addDashboardWorker = function * (action) {
    const { dashboardsLoaded } = this.actions

    const name = window.prompt('Name of the new dashboard')
    if (name) {
      const { dashboards, error } = yield dashboardController.addDashboard({ name: name })
      if (dashboards) {
        yield put(dashboardsLoaded(dashboards))
      } else {
        messg.error(error, 2500)
      }
    }
  }
}
