import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class DashboardLogic extends Logic {
  path = () => ['scenes', 'dashboard', 'index']

  actions = ({ constants }) => ({
    addDashboard: true,

    saveDashboard: true,
    dashboardSaveSuccess: (dashboardId) => ({ dashboardId }),
    dashboardSaveFailure: (dashboardId) => ({ dashboardId }),

    layoutChanged: (layout, layouts) => ({ layout, layouts }),
    updateLayouts: (layouts, dashboardId) => ({ layouts, dashboardId }),
    setCurrentBreakpoint: (breakpoint) => ({ breakpoint }),

    selectDashboard: (id, layout) => ({ id, layout }),
    dashboardsLoaded: (dashboards) => ({ dashboards }),
  })

  reducers = ({ actions, constants }) => ({
    selectedDashboardId: [null, PropTypes.number, {
      [actions.selectDashboard]: (_, payload) => payload.id
    }],

    dashboards: [{}, PropTypes.object, {
      [actions.dashboardsLoaded]: (_, payload) => {
        let newState = {}
        payload.dashboards.forEach(dashboard => {
          newState[dashboard.id] = dashboard
        })
        return newState
      },
      [actions.updateLayouts]: (state, payload) => {
        const { layouts, dashboardId } = payload

        if (state && state[dashboardId] && state[dashboardId].layouts) {
          return {
            ...state,
            [dashboardId]: {
              ...state[dashboardId],
              changedLayouts: layouts,
              unsaved: true
            }
          }
        } else {
          return state
        }
      },
      [actions.dashboardSaveSuccess]: (state, payload) => {
        const { dashboardId } = payload
        if (state && state[dashboardId] && state[dashboardId].unsaved) {
          return {
            ...state,
            [dashboardId]: {
              ...state[dashboardId],
              unsaved: false
            }
          }
        } else {
          return state
        }
      }
    }],

    savingDashboard: [false, PropTypes.bool, {
      [actions.saveDashboard]: () => true,
      [actions.dashboardSaveFailure]: () => false,
      [actions.dashboardSaveSuccess]: () => false
    }],

    currentBreakpoint: ['desktop', PropTypes.string, {
      [actions.setCurrentBreakpoint]: (_, payload) => payload.breakpoint
    }]
  })

  selectors = ({ constants, selectors }) => ({
    dashboard: [
      () => [selectors.dashboards, selectors.selectedDashboardId],
      (dashboards, selectedDashboardId) => dashboards && dashboards[selectedDashboardId],
      PropTypes.object
    ],

    items: [
      () => [selectors.dashboard, selectors.currentBreakpoint],
      (dashboard, selectedDashboardId) => (dashboard && dashboard.items) || {},
      PropTypes.object
    ],

    layouts: [
      () => [selectors.dashboard],
      (dashboard) => (dashboard && (dashboard.changedLayouts || dashboard.layouts)) || { mobile: [], desktop: [] },
      PropTypes.object
    ],

    layoutsUnsaved: [
      () => [selectors.dashboard],
      (dashboard) => dashboard && dashboard.unsaved,
      PropTypes.bool
    ],

    layout: [
      () => [selectors.layouts, selectors.currentBreakpoint],
      (layouts, currentBreakpoint) => (layouts && layouts[currentBreakpoint]) || [],
      PropTypes.array
    ]
  })
}
