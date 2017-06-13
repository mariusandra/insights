import { all, put, fork, call } from 'redux-saga/effects'
import Saga from 'kea/saga'
import { LOCATION_CHANGE, push } from 'react-router-redux'

import messg from 'messg'

import dashboardLogic from '~/scenes/dashboard/logic'

import client from '~/client'

const dashboardsService = client.service('api/dashboards')
const dashboardItemsService = client.service('api/dashboard-items')

const dashboardController = {}

export default class DashboardSaga extends Saga {
  actions = () => ([
    dashboardLogic, [
      'dashboardsLoaded',
      'dashboardItemsLoaded',
      'dashboardUpdated',
      'dashboardRemoved',
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
    const { dashboardsLoaded, dashboardItemsLoaded } = this.actions

    const [
      dashboards,
      dashboardItems
    ] = yield all([
      dashboardsService.find(),
      dashboardItemsService.find()
    ])

    yield put(dashboardItemsLoaded(dashboardItems.data))
    yield put(dashboardsLoaded(dashboards.data))
  }

  dashboardsLoadedWorker = function * (action) {
    const { selectDashboard } = this.actions
    const { dashboards } = action.payload

    const selectedDashboardId = yield dashboardLogic.get('selectedDashboardId')
    if (selectedDashboardId === null && Object.keys(dashboards).length > 0) {
      const firstDashboard = Object.values(dashboards)[0]
      yield put(selectDashboard(firstDashboard._id))
    }
  }

  addDashboardWorker = function * (action) {
    const { dashboardUpdated, selectDashboard } = this.actions

    const name = window.prompt('Name of the new dashboard')
    if (name) {
      const dashboard = yield dashboardsService.create({ name, mobileLayout: [], desktopLayout: [] })
      yield put(dashboardUpdated(dashboard))
      yield put(selectDashboard(dashboard._id))
    }
  }

  deleteDashboardWorker = function * (action) {
    const { dashboardRemoved, selectDashboard } = this.actions

    const { dashboardId } = action.payload
    const { dashboards } = yield dashboardLogic.fetch('dashboards')

    const dashboard = dashboards[dashboardId]

    const response = window.confirm(`Are you sure you want to delete the dashboad "${dashboard.name}"? This can't be reversed!`)

    if (response) {
      yield dashboardsService.remove(dashboardId)
      yield put(dashboardRemoved(dashboardId))

      const dashboardIds = Object.keys(dashboards)

      const index = dashboardIds.indexOf(dashboardId)
      if (index > 0) {
        yield put(selectDashboard(dashboardIds[index - 1]))
      } else {
        yield put(selectDashboard(dashboardIds[0]))
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
