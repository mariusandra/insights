import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

// const outerActions = selectActionsFromLogic([
//   otherScene, [
//     'doSomething'
//   ]
// ])

var defaultLayout = [
  {
    w: 1,
    h: 1,
    x: 0,
    y: 0,
    i: '0',
    moved: false,
    'static': false
  },
  {
    w: 1,
    h: 1,
    x: 0,
    y: 1,
    i: '1',
    moved: false,
    'static': false
  },
  {
    w: 4,
    h: 4,
    x: 2,
    y: 0,
    i: '2',
    moved: false,
    'static': false
  }
]

@initLogic
export default class DashboardLogic extends Logic {
  path = () => ['scenes', 'dashboard', 'index']

  constants = () => [
    // 'SHOW_ALL',
    // 'SHOW_ACTIVE',
    // 'SHOW_COMPLETED'
  ]

  actions = ({ constants }) => ({
    addDashboard: true,
    setLayout: (layout, layouts) => ({ layout }),

    selectDashboard: (id, layout) => ({ id, layout }),
    dashboardsLoaded: (dashboards) => ({ dashboards })
  })

  reducers = ({ actions, constants }) => ({
    selectedDashboardId: [null, PropTypes.number, {
      [actions.selectDashboard]: (_, payload) => payload.id
    }],

    // { 1: { layout: [{ x, y, w, h, path, name }], name: .. } }
    dashboards: [{}, PropTypes.object, {
      [actions.dashboardsLoaded]: (_, payload) => {
        let newState = {}
        payload.dashboards.forEach(dashboard => {
          newState[dashboard.id] = dashboard
        })
        return newState
      }
    }]
  })

  selectors = ({ constants, selectors }) => ({
    layout: [
      () => [selectors.selectedDashboardId, selectors.dashboards],
      (id, dashboards) => dashboards[id] ? dashboards[id].layout : [],
      PropTypes.array
    ]
  })
}
