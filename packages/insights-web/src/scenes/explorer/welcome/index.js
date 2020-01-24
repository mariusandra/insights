import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Icon } from '@blueprintjs/core'

import viewsLogic from 'scenes/header/views/logic'

export default function Welcome () {
  const { groupedViews } = useValues(viewsLogic)
  const { openView } = useActions(viewsLogic)

  return (
    <div className='explorer-welcome'>
      <h1>Welcome to Insights!</h1>
      <p>
        First time here? Check the <u>quickstart</u>! (coming soon...)
      </p>
      <br />
      <h2>Saved views</h2>
      {groupedViews.length === 0 ? <p>
        When you save a view by clicking the <Icon icon='star' title='star' /> in the top right, it will show up here.
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
