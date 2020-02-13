import { kea } from 'kea'
import PropTypes from 'prop-types'
import urlToState from 'lib/explorer/url-to-state'
import { message } from 'antd'
import { push } from "connected-react-router"
import client from 'lib/client'

const viewsService = client.service('views')

export default kea({
  path: () => ['scenes', 'header', 'views'],

  actions: () => ({
    openNew: true,
    cancelNew: true,

    setNewName: (newName) => ({ newName }),

    openView: (id) => ({ id }),

    saveView: true,
    viewSaved: (view) => ({ view }),

    loadViews: true,
    viewsLoaded: (views) => ({ views }),

    removeView: (id) => ({ id }),
    viewRemoved: (id) => ({ id })
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
      [actions.viewRemoved]: (state, payload) => {
        const { [payload.id]: discard, ...rest } = state
        return rest
      },
      [actions.viewSaved]: (state, payload) => Object.assign({}, state, { [payload.view._id]: payload.view })
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedViews: [
      () => [selectors.views],
      (views) => Object.values(views).sort((a, b) => a.name.localeCompare(b.name)),
      PropTypes.array
    ]
  }),

  events: ({ actions }) => ({
    afterMount () {
      actions.loadViews()
    }
  }),

  listeners: ({ actions, values, store }) => ({
    [actions.loadViews]: async () => {
      const results = await viewsService.find({})

      if (results.total > 0) {
        actions.viewsLoaded(results.data)
      }
    },

    [actions.saveView]: async () => {
      const { newName } = values

      if (newName.trim()) {
        const newPath = `${window.location.pathname}${window.location.search}`
        const urlValues = urlToState(newPath)

        if (urlValues.connection) {
          const [connectionId, subsetId] = urlValues.connection.split('--')
          const result = await viewsService.create({
            connectionId,
            subsetId,
            name: newName,
            path: newPath
          })

          if (result) {
            message.success(`View "${newName}" saved!`)
            actions.viewSaved(result)
          }
        } else {
          message.error('No connection selected, can not save view')
        }
      } else {
        message.error('Please enter a name')
      }
    },

    [actions.openView]: async ({ id }) => {
      const { views } = values
      const view = views[id]

      if (view) {
        store.dispatch(push(view.path))
      }
    }
  })
})
