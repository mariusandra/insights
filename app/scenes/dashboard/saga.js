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
      'setCurrentBreakpoint',
      'layoutChanged',
      'updateLayouts',
      'addDashboard',
      'undoDashboard',
      'saveDashboard',
      'dashboardSaveSuccess',
      'dashboardSaveFailure'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.addDashboard]: this.addDashboardWorker,
    [actions.dashboardsLoaded]: this.dashboardsLoadedWorker,
    [actions.layoutChanged]: this.layoutChangedWorker
  })

  takeLatest = ({ actions }) => ({
    [actions.saveDashboard]: this.saveDashboardWorker
  })

  run = function * () {
    yield fork(this.setCurrentBreakpoint)
    yield fork(this.loadDashboards)
  }

  setCurrentBreakpoint = function * (action) {
    const { setCurrentBreakpoint } = this.actions
    yield put(setCurrentBreakpoint(window.innerWidth >= 768 ? 'desktop' : 'mobile'))
  }

  loadDashboards = function * (action) {
    const { dashboardsLoaded } = this.actions

    const { dashboards } = yield dashboardController.getDashboards({})
    yield put(dashboardsLoaded(dashboards))
  }

  dashboardsLoadedWorker = function * (action) {
    const { selectDashboard } = this.actions
    const { dashboards } = action.payload

    const selectedDashboardId = yield dashboardLogic.get('selectedDashboardId')
    if (selectedDashboardId === null && Object.keys(dashboards).length > 0) {
      const firstDashboard = Object.values(dashboards)[0]
      yield put(selectDashboard(firstDashboard.id))
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

  layoutChangedWorker = function * (action) {
    const { updateLayouts } = this.actions
    const { layouts } = action.payload

    const { selectedDashboardId, layouts: currentLayouts } = yield dashboardLogic.fetch('selectedDashboardId', 'layouts')

    if (JSON.stringify(currentLayouts) !== JSON.stringify(layouts)) {
      yield put(updateLayouts(layouts, selectedDashboardId))
    }
  }

  saveDashboardWorker = function * (action) {
    const { dashboardSaveSuccess, dashboardSaveFailure, dashboardsLoaded } = this.actions
    const { dashboardId } = action.payload
    const { layouts, dashboard } = yield dashboardLogic.fetch('selectedDashboardId', 'layouts', 'dashboard')

    const renamedItems = dashboard.changedItems
                            ? Object.values(dashboard.changedItems).filter(i => dashboard.items[i.id].name !== i.name).map(i => [i.id, i.name])
                            : []

    const deletedItems = dashboard.changedItems
                            ? Object.values(dashboard.items).filter(i => !dashboard.changedItems[i.id]).map(i => i.id)
                            : []

    try {
      const props = {
        id: dashboardId,
        mobileLayout: JSON.stringify(layouts.mobile),
        desktopLayout: JSON.stringify(layouts.desktop),
        renamedItems,
        deletedItems
      }
      const result = yield dashboardController.saveDashboard(props)

      if (result.dashboards) {
        yield put(dashboardSaveSuccess(dashboardId))
        yield put(dashboardsLoaded(result.dashboards))
        messg.success('Layout saved', 2500)
      } else if (messg.error) {
        yield put(dashboardSaveFailure(dashboardId))
        messg.error(result.error, 2500)
      }
    } catch (error) {
      yield put(dashboardSaveFailure(dashboardId))
      messg.error('Unexpected error', 2500)
    }
  }
}
