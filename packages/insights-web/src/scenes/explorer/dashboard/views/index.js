import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import { Card, Icon } from 'antd'
import PropTypes from 'prop-types'
import urlToState from 'lib/explorer/url-to-state'

import explorerLogic from 'scenes/explorer/logic'
import viewsLogic from 'scenes/header/views/logic'

const logic = kea({
  connect: {
    values: [explorerLogic, ['subsetViews', 'selectedModel']]
  },

  selectors: ({ selectors }) => ({
    groupedViews: [
      () => [selectors.subsetViews, selectors.selectedModel],
      (subsetViews, selectedModel) => {
        let groups = {}
        subsetViews.forEach(view => {
          let model = ''
          const viewState = urlToState(view.path)
          if (viewState.columns && viewState.columns[0]) {
            model = viewState.columns[0].split('.')[0]
          }
          if (model && (!selectedModel || selectedModel === model)) {
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

export default function Views () {
  const { groupedViews } = useValues(logic)
  const { selectedModel } = useValues(explorerLogic)

  const { openView } = useActions(viewsLogic)

  return (
    <Card bordered={false} title={
      <>
        <Icon type='star' theme={groupedViews.length > 0 ? "filled" : ''}
              style={{color: 'white', marginRight: 5}}/>
        Saved views

      </>
    }>
      {groupedViews.length === 0 ? (
        <div>
          Saved views will appear here
        </div>
      ) : (
        <div>
          {groupedViews.map(({group, views}) => (
            <div key={group} className='saved-views'>
              {selectedModel !== group ? <strong>{group}</strong> : null}
              <ul>
                {views.map(view => (
                  <li key={view._id}>
                    <span>
                      <Icon type="caret-right" />
                    </span>
                    <div>
                      <a href={view.path} style={{cursor: 'pointer'}} onClick={e => { e.preventDefault(); openView(view._id) }}>{view.name}</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
