import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

// const outerActions = selectActionsFromLogic([
//   otherScene, [
//     'doSomething'
//   ]
// ])

@initLogic
export default class HeaderLogic extends Logic {
  path = () => ['scenes', 'header', 'index']

  constants = () => [
    // 'SHOW_ALL',
    // 'SHOW_ACTIVE',
    // 'SHOW_COMPLETED'
  ]

  actions = ({ constants }) => ({
    showAll: true
  })

  reducers = ({ actions, constants }) => ({
    visibilityFilter: ['', PropTypes.string, {
      [actions.showAll]: () => 'all'
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
