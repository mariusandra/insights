import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class DashboardLogic extends Logic {
  path = () => ['scenes', 'dashboard', 'index']

  actions = ({ constants }) => ({
    addDashboard: true,

    saveDashboard: (dashboardId) => ({ dashboardId }),
    undoDashboard: (dashboardId) => ({ dashboardId }),

    dashboardSaveSuccess: (dashboardId) => ({ dashboardId }),
    dashboardSaveFailure: (dashboardId) => ({ dashboardId }),

    layoutChanged: (layout, layouts) => ({ layout, layouts }),
    updateLayouts: (layouts, dashboardId) => ({ layouts, dashboardId }),
    setCurrentBreakpoint: (breakpoint) => ({ breakpoint }),

    selectDashboard: (dashboardId, layout) => ({ dashboardId, layout }),
    dashboardsLoaded: (dashboards) => ({ dashboards }),

    startResizing: (dashboardId) => ({ dashboardId }),
    stopResizing: (dashboardId) => ({ dashboardId }),

    renameItem: (dashboardId, itemId, name) => ({ dashboardId, itemId, name }),
    deleteItem: (dashboardId, itemId) => ({ dashboardId, itemId })
  })

  reducers = ({ actions, constants }) => ({
    selectedDashboardId: [null, PropTypes.number, {
      [actions.selectDashboard]: (_, payload) => payload.dashboardId
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
      [actions.undoDashboard]: (state, payload) => {
        const { dashboardId } = payload
        if (state && state[dashboardId]) {
          return {
            ...state,
            [dashboardId]: {
              ...state[dashboardId],
              changedLayouts: null,
              changedItems: null,
              unsaved: false
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
      },
      [actions.renameItem]: (state, payload) => {
        const { dashboardId, itemId, name } = payload

        if (state && state[dashboardId] && state[dashboardId].items) {
          return {
            ...state,
            [dashboardId]: {
              ...state[dashboardId],
              changedItems: {
                ...(state[dashboardId].changedItems || state[dashboardId].items),
                [itemId]: {
                  ...(state[dashboardId].changedItems || state[dashboardId].items)[itemId],
                  name: name
                }
              },
              unsaved: true
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

    resizingItem: [null, PropTypes.string, {
      [actions.startResizing]: (_, payload) => payload.dashboardId,
      [actions.stopResizing]: () => null
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
      (dashboard, selectedDashboardId) => (dashboard && (dashboard.changedItems || dashboard.items)) || {},
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
