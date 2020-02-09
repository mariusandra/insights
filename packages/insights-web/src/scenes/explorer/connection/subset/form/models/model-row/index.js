import { Tag } from 'antd'
import React from 'react'

export default function ModelRow ({ model, ignoredColumnCount, addedColumnCount }) {
  return (
    <span>
      {model}{' '}

      {ignoredColumnCount > 0 ? (
        <Tag className='ignore-tag'>{ignoredColumnCount} field{ignoredColumnCount === 1 ? '' : 's'} ignored</Tag>
      ) : null}

      {addedColumnCount > 0 ? (
        <Tag className='ignore-tag' color='blue'>{addedColumnCount} field{addedColumnCount === 1 ? '' : 's'} added</Tag>
      ) : null}
    </span>
  )
}
