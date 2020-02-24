import './styles.scss'

import React from 'react'
import { useValues } from 'kea'

import { Icon } from 'antd'

import OneFilter from './one-filter'

import explorerLogic from 'scenes/explorer/logic'

export default function Filter () {
  const { filter } = useValues(explorerLogic)

  let i = 0

  return (
    <div className='insights-filter'>
      <div className='filter-header'>
        <span className='filter-preview'>
          {filter.map(({ key, value }) => (
            <OneFilter key={`${i}.${key}`} filterPrefix={`...filters.${i}`} column={key} value={value} index={i++} />
          ))}
          {filter.length === 0 ? (
            <span className='filter-placeholder'>Click on <Icon type='filter' /> icons to add filters</span>
          ) : null}
        </span>
      </div>
    </div>
  )
}
