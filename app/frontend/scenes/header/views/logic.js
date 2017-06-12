import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class ViewsLogic extends Logic {
  path = () => ['scenes', 'header', 'views']

  actions = ({ constants }) => ({
    openNew: true,
    cancelNew: true,

    setNewName: (newName) => ({ newName }),

    openView: (id) => ({ id }),

    saveView: true,
    viewSaved: (view) => ({ view }),
    viewsLoaded: (views) => ({ views })
  })

  reducers = ({ actions, constants }) => ({
    newOpen: [false, PropTypes.bool, {
      [actions.openNew]: () => true,
      [actions.cancelNew]: () => false,
      [actions.viewSaved]: () => false
    }],

    newName: ['', PropTypes.string, {
      [actions.setNewName]: (_, payload) => payload.newName,
      [actions.cancelNew]: () => '',
      [actions.viewSaved]: () => ''
    }],

    views: [{}, PropTypes.object, {
      [actions.viewsLoaded]: (_, payload) => {
        const newState = {}
        payload.views.forEach(view => {
          newState[view.id] = view
        })
        return newState
      },
      [actions.viewSaved]: (state, payload) => Object.assign({}, state, { [payload.view.id]: payload.view })
    }]
  })

  selectors = ({ constants, selectors }) => ({
    sortedViews: [
      () => [selectors.views],
      (views) => Object.values(views).sort((a, b) => a.name.localeCompare(b.name)),
      PropTypes.array
    ]
  })
}
