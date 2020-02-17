import React from 'react'
import { Tag } from 'antd'

export function AggregateList ({ aggregate, meta, setAggregate, className }) {
  if (meta.index === 'primary_key' && aggregate === 'count') {
    return null
  }
  if (meta.index !== 'primary_key' && meta.type !== 'string' && meta.type !== 'number') {
    return null
  }

  return (
    <div className={className}>
      {meta.type === 'string' || meta.type === 'number' ? (
        <>
          <Tag color={aggregate === 'min' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setAggregate('min')} style={{ cursor: 'pointer' }}>Min</Tag>
          <Tag color={aggregate === 'max' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setAggregate('max')} style={{ cursor: 'pointer' }}>Max</Tag>
        </>
      ) : null}
      {meta.type === 'number' ? (
        <>
          <Tag color={aggregate === 'avg' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setAggregate('avg')} style={{ cursor: 'pointer' }}>Avg</Tag>
          <Tag color={aggregate === 'sum' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setAggregate('sum')} style={{ cursor: 'pointer' }}>Sum</Tag>
        </>
      ) : null}
    </div>
  )
}
