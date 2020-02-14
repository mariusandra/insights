import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import { Icon } from 'antd'

import urlToState from 'lib/explorer/url-to-state'
import explorerLogic from 'scenes/explorer/logic'
import viewsLogic from 'scenes/header/views/logic'
import PropTypes from 'prop-types'

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

export default function Welcome () {
  const { groupedViews } = useValues(logic)
  const { openView } = useActions(viewsLogic)

  return (
    <div className='explorer-welcome'>
      <h1>Welcome to Insights!</h1>
      <p>
        You're brave for checking out this early release! Thank you!
      </p>
      <p>
        Please file all questions and bug reports on <a href='https://github.com/mariusandra/insights' target='_blank'><u>github</u></a>!
      </p>
      <br />
      <h2>Saved views</h2>
      {groupedViews.length === 0 ? <p>
        When you save a view by clicking the <Icon type="star" theme="filled" /> in the top right, it will show up here.
      </p> : <div>
        {groupedViews.map(({ group, views }) => (
          <div key={group}>
            <strong>{group}</strong>
            <ol>
              {views.map(view => (
                <li key={view._id}>
                  <u style={{ cursor: 'pointer' }} onClick={() => openView(view._id)}>{view.name}</u>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>}
    </div>
  )
}
