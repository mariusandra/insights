import React from 'react'
import { useValues } from 'kea'

import explorerLogic from 'scenes/explorer/logic'

export default function Pagination () {
  const { count, visibleStart, visibleEnd } = useValues(explorerLogic)

  if (count === 0) {
    return <span />
  }

  return (
    <span>
      {count > 0 ? (
        <span>
          {visibleStart} - {visibleEnd} of
          {' '}
        </span>
      ) : null}
      {count}
    </span>
  )
}
