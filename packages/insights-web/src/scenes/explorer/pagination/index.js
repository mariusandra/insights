import React from 'react'
import { useValues } from 'kea'

import explorerLogic from 'scenes/explorer/logic'

export default function Pagination () {
  const { count, visibleStart, visibleEnd } = useValues(explorerLogic)

  return (
    <div style={{ lineHeight: '30px' }}>
      {count > 0 ? (
        <span>
          {visibleStart} - {visibleEnd} of
          {' '}
        </span>
      ) : null}
      {count} results
    </div>
  )
}
