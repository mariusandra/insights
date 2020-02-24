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
    values: [explorerLogic, ['subsetViews']]
  },

  selectors: ({ selectors }) => ({
    groupedViews: [
      () => [selectors.subsetViews],
      (subsetViews) => {
        let groups = {}
        subsetViews.forEach(view => {
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

export default function Views () {
  const {groupedViews} = useValues(logic)

  const {openView} = useActions(viewsLogic)

  return (
    <Card bordered={false}>
      <h2>
        Saved views
        <Icon type='star' theme={groupedViews.length > 0 ? "filled" : ''}
              style={{color: 'hsl(42, 98%, 45%)', marginLeft: 5}}/>
      </h2>
      {groupedViews.length === 0 ? (
        <p>
          Saved views will show up here
        </p>
      ) : (
        <div>
          {groupedViews.map(({group, views}) => (
            <div key={group} className='saved-views'>
              <strong>{group}</strong>
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
