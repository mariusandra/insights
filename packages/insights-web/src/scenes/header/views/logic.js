import { kea } from 'kea'
import PropTypes from 'prop-types'
import urlToState from '../../../lib/explorer/url-to-state'

export default kea({
  path: () => ['scenes', 'header', 'views'],

  actions: () => ({
    openNew: true,
    cancelNew: true,

    setNewName: (newName) => ({ newName }),

    openView: (id) => ({ id }),

    saveView: true,
    viewSaved: (view) => ({ view }),
    viewsLoaded: (views) => ({ views })
  }),

  reducers: ({ actions }) => ({
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
          newState[view._id] = view
        })
        return newState
      },
      [actions.viewSaved]: (state, payload) => Object.assign({}, state, { [payload.view._id]: payload.view })
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedViews: [
      () => [selectors.views],
      (views) => Object.values(views).sort((a, b) => a.name.localeCompare(b.name)),
      PropTypes.array
    ],

    groupedViews: [
      () => [selectors.sortedViews],
      (sortedViews) => {
        let groups = {}
        sortedViews.forEach(view => {
          let model = ''
          const viewState = urlToState(view.path)
          if (viewState.columns && viewState.columns[0]) {
            model = viewState.columns[0].split('.')[0]
          }
          if (model) {
            if (!groups[model]) {
              groups[model] = []
            }
            groups[model].push(view)
          }
        })

        let groupKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b))

        return groupKeys.map(key => ({ group: key, views: groups[key] }))
      },
      PropTypes.array
    ]
  })
})
