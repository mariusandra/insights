import React from 'react'
import { Icon, Tag, Tooltip } from 'antd'

export function AggregateList ({ columnsMeta, aggregate, meta, setAggregate, className }) {
  if (meta.index !== 'primary_key' && meta.type !== 'string' && meta.type !== 'number') {
    return null
  }

  const showCountWarning = meta.index === 'primary_key' && !aggregate && Object.values(columnsMeta).find(m => m.type === 'date' || m.type === 'time') && !Object.values(columnsMeta).find(m => m.aggregate)

  return (
    <div className={className}>
      {meta.index === 'primary_key' ? (
        <Tag color={aggregate === 'count' ? 'hsl(209, 32%, 40%)' : ''} onClick={() => setAggregate('count')} style={{ cursor: 'pointer' }}>
          Count
          {showCountWarning ? (
            <Tooltip title='Click here to count the IDs and show a graph'>
              <Icon type="warning" style={{ color: 'hsla(42, 102%, 35%, 1)', marginLeft: 5 }} />
            </Tooltip>
          ) : null}
        </Tag>
      ) : null}
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
