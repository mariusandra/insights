import { put, fork, call } from 'redux-saga/effects'
import Saga from 'kea/saga'
import { LOCATION_CHANGE, push } from 'react-router-redux'

import messg from 'messg'

import dashboardLogic from '~/scenes/dashboard/logic'

// import dashboardController from '~/scenes/dashboard/controller.rb'

const dashboardController = {}

export default class DashboardSaga extends Saga {
  actions = () => ([
    dashboardLogic, [
      'dashboardsLoaded',
      'selectDashboard',
      'setCurrentBreakpoint',
      'layoutChanged',
      'updateLayouts',
      'addDashboard',
      'deleteDashboard',
      'undoDashboard',
      'saveDashboard',
      'dashboardSaveSuccess',
      'dashboardSaveFailure'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.addDashboard]: this.addDashboardWorker,
    [actions.deleteDashboard]: this.deleteDashboardWorker,
    [actions.dashboardsLoaded]: this.dashboardsLoadedWorker,
    [actions.layoutChanged]: this.layoutChangedWorker,

    [LOCATION_CHANGE]: this.setDashboardFromUrl,
    [actions.selectDashboard]: this.setUrlFromDashboard
  })

  takeLatest = ({ actions }) => ({
    [actions.saveDashboard]: this.saveDashboardWorker
  })

  run = function * () {
    yield call(this.setDashboardFromUrl)
    yield fork(this.setCurrentBreakpoint)
    yield fork(this.loadDashboards)
  }

  setCurrentBreakpoint = function * () {
    const { setCurrentBreakpoint } = this.actions
    yield put(setCurrentBreakpoint(window.innerWidth >= 768 ? 'desktop' : 'mobile'))
  }

  setDashboardFromUrl = function * () {
    const { selectDashboard } = this.actions

    const selectedDashboardId = yield dashboardLogic.get('selectedDashboardId')

    const pathname = window.location.pathname
    const match = pathname.match(/\/dashboard\/([0-9]+)\/?/)
    const urlDashboardId = match ? parseInt(match[1]) : null

    if (match && urlDashboardId !== selectedDashboardId) {
      yield put(selectDashboard(urlDashboardId))
    }
  }

  setUrlFromDashboard = function * () {
    const selectedDashboardId = yield dashboardLogic.get('selectedDashboardId')

    const pathname = window.location.pathname
    const match = pathname.match(/\/dashboard\/([0-9]+)\/?/)
    const urlDashboardId = match ? parseInt(match[1]) : null

    if (selectedDashboardId !== urlDashboardId) {
      if (selectedDashboardId) {
        yield put(push(`/dashboard/${selectedDashboardId}`))
      } else {
        yield put(push('/dashboard'))
      }
    }
  }

  loadDashboards = function * () {
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
    const { dashboardsLoaded, selectDashboard } = this.actions

    const name = window.prompt('Name of the new dashboard')
    if (name) {
      const { dashboards, error } = yield dashboardController.addDashboard({ name: name })
      if (dashboards) {
        const dashboardIds = Object.values(dashboards).map(d => parseInt(d.id)).sort((a, b) => a - b)
        const lastDashboard = dashboardIds[dashboardIds.length - 1]
        yield put(selectDashboard(lastDashboard))
        yield put(dashboardsLoaded(dashboards))
      } else {
        messg.error(error, 2500)
      }
    }
  }

  deleteDashboardWorker = function * (action) {
    const { dashboardsLoaded, selectDashboard } = this.actions

    const { dashboardId } = action.payload
    const { dashboards } = yield dashboardLogic.fetch('dashboards')

    const dashboard = dashboards[dashboardId]

    const response = window.confirm(`Are you sure you want to delete the dashboad "${dashboard.name}"? This can't be reversed!`)
    if (response) {
      const { dashboards, error } = yield dashboardController.deleteDashboard({ id: dashboardId })
      if (dashboards) {
        const dashboardIds = Object.values(dashboards).map(d => parseInt(d.id)).sort((a, b) => a - b)
        const firstDashboard = dashboardIds[0]
        yield put(selectDashboard(firstDashboard))
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
