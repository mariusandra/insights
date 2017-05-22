import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

import range from 'lib/utils/range'

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
    setLayout: (layout, layouts) => ({ layout })
  })

  reducers = ({ actions, constants }) => ({
    layout: [defaultLayout, PropTypes.array, {
      [actions.setLayout]: (_, payload) => payload.layout
    }]
  })

  selectors = ({ constants, selectors }) => ({
    // todoCount: [
    //   () => [selectors.todos],
    //   (todos) => todos.length,
    //   PropTypes.number
    // ]
  })
}
