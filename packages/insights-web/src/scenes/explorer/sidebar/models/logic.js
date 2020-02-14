import { kea } from 'kea'

import explorerLogic from '../../logic'
import urlToState from '../../../../lib/explorer/url-to-state'

export default kea({
  connect: {
    values: [
      explorerLogic, ['subsetPinnedFields', 'subsetViews']
    ]
  },

  selectors: ({ selectors }) => ({
    pinnedPerModel: [
      () => [selectors.subsetPinnedFields],
      (subsetPinnedFields) => {
        const pinned = {}
        subsetPinnedFields.forEach(({ model }) => {
          pinned[model] = (pinned[model] || 0) + 1
        })
        return pinned
      }
    ],
    viewsPerModel: [
      () => [selectors.subsetViews],
      (subsetViews) => {
        const views = {}
        subsetViews.forEach((view) => {
          const state = urlToState(view.path)
          const [column, ] = state.columns

          const model = (column || '').split('!')[0].split('.')[0]
          if (model) {
            views[model] = (views[model] || 0) + 1
          }
        })
        return views
      }
    ]
  })
})
