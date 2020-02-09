import { Tag } from 'antd'
import React from 'react'

export default function ModelRow ({ model, ignoredColumnCount, addedColumnCount, editedColumnCount }) {
  return (
    <span>
      {model}{' '}

      {ignoredColumnCount > 0 ? (
        <Tag className='ignore-tag'>{ignoredColumnCount} field{ignoredColumnCount === 1 ? '' : 's'} ignored</Tag>
      ) : null}

      {addedColumnCount > 0 ? (
        <Tag className='ignore-tag' color='blue'>{addedColumnCount} field{addedColumnCount === 1 ? '' : 's'} added</Tag>
      ) : null}

      {editedColumnCount > 0 ? (
        <Tag className='ignore-tag' color='purple'>{editedColumnCount} field{editedColumnCount === 1 ? '' : 's'} edited</Tag>
      ) : null}
    </span>
  )
}
