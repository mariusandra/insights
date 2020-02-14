import React from 'react'
import { Button, Icon } from 'antd'
import OneFilter from 'scenes/explorer/filter/one-filter'

export function ColumnFilters ({ filter, path, onAddClick, filterPrefixString = 'tree' }) {
  let i = 0
  let hasFilters = false

  return (
    <div>
      {filter.map(({key, value}) => {
        if (key !== path) {
          i += 1
          return null
        }
        hasFilters = true
        return (
          <div key={`${i}.${key}.${value}`} style={{marginBottom: 15}}>
            <OneFilter filterPrefix={`...${filterPrefixString}.${i}`} column={key} value={value} index={i++} placement='right'/>
          </div>
        )
      }).filter(v => v)}

      <div style={{ marginTop: hasFilters ? 20 : 0 }}>
        <Button onClick={onAddClick} size='small'>
          <Icon type='filter'/> Add {hasFilters ? 'another' : 'a'} filter
        </Button>
      </div>
    </div>
  )
}
